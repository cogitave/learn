/**
 * Minimal YAML subset parser for the learn-pr content set.
 *
 * Deliberately NOT a general YAML implementation. It supports exactly the
 * constructs the corpus uses, and fails loudly on anything else rather than
 * guessing:
 *
 *   - `### YamlMime:<Type>` type directive on line 1
 *   - `key: value` scalars (bare, single- and double-quoted)
 *   - nested mappings by indentation
 *   - block sequences (`- item`) of scalars and of mappings
 *   - block scalars (`|`, `|-`) for prose fields
 *   - `true`/`false`, integers, and `null`/`~`; everything else stays a string
 *   - `#` line comments
 *
 * Anchors, aliases, flow collections, multi-document streams, tags and folded
 * scalars (`>`) are not supported: none appear in the content set, and silently
 * mis-parsing them would be worse than refusing.
 *
 * Rationale for writing this rather than depending on a YAML library:
 * ADR-0003 (build from scratch - reference, not dependency).
 */

const MIME_RE = /^###\s*YamlMime:([A-Za-z][A-Za-z0-9]*)\s*$/;
const KEY_RE = /^([A-Za-z_][A-Za-z0-9_.\-]*)\s*:(?:\s+(.*))?$/;

export class YamlError extends Error {
  constructor(message, line) {
    super(line == null ? message : `${message} (line ${line + 1})`);
    this.name = 'YamlError';
    this.line = line;
  }
}

/** Parse a learn-pr document, returning its YamlMime type and data. */
export function parseYamlMime(text, file = '<memory>') {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const m = MIME_RE.exec(firstLine);
  if (!m) {
    throw new YamlError(`${file}: first line must match '### YamlMime:<Type>'`, 0);
  }
  return { mime: m[1], data: parseYaml(text, file) };
}

/** Parse a YAML document body. Any `### YamlMime:` directive is skipped. */
export function parseYaml(text, file = '<memory>') {
  const raw = text.split(/\r?\n/);
  // Keep original line numbers for error messages by nulling skipped lines
  // rather than dropping them.
  const lines = raw.map((l) => (MIME_RE.test(l) ? null : l));
  const ctx = { lines, file };
  const { value } = parseBlock(ctx, 0, 0);
  return value ?? {};
}

/** True for lines that carry no structure (blank, comment, or skipped). */
function isSkippable(line) {
  if (line == null) return true;
  const t = line.trim();
  return t === '' || t.startsWith('#');
}

function indentOf(line) {
  return line.length - line.trimStart().length;
}

/** Advance past skippable lines; returns the next meaningful index or -1. */
function nextMeaningful(ctx, i) {
  while (i < ctx.lines.length && isSkippable(ctx.lines[i])) i += 1;
  return i < ctx.lines.length ? i : -1;
}

/**
 * Parse a block (mapping or sequence) whose entries sit at `indent`.
 * Returns the parsed value and the index of the first unconsumed line.
 */
function parseBlock(ctx, start, indent) {
  const i = nextMeaningful(ctx, start);
  if (i === -1) return { value: null, next: ctx.lines.length };
  if (indentOf(ctx.lines[i]) < indent) return { value: null, next: i };

  const actual = indentOf(ctx.lines[i]);
  const head = ctx.lines[i].trimStart();
  return head.startsWith('- ') || head === '-'
    ? parseSequence(ctx, i, actual)
    : parseMapping(ctx, i, actual);
}

function parseMapping(ctx, start, indent) {
  const out = {};
  let i = start;

  while (i < ctx.lines.length) {
    if (isSkippable(ctx.lines[i])) {
      i += 1;
      continue;
    }
    const line = ctx.lines[i];
    const ind = indentOf(line);
    if (ind < indent) break;
    if (ind > indent) {
      throw new YamlError(`${ctx.file}: unexpected indentation in mapping`, i);
    }

    const body = line.slice(indent);
    const m = KEY_RE.exec(body);
    if (!m) throw new YamlError(`${ctx.file}: expected 'key: value', got '${body.trim()}'`, i);

    const key = m[1];
    const rest = (m[2] ?? '').trim();

    if (rest === '|' || rest === '|-' || rest === '|+') {
      const { value, next } = parseBlockScalar(ctx, i + 1, indent, rest);
      out[key] = value;
      i = next;
      continue;
    }

    if (rest === '') {
      const j = nextMeaningful(ctx, i + 1);
      if (j === -1 || indentOf(ctx.lines[j]) <= indent) {
        // A block sequence may legally sit at the parent key's own indent.
        if (
          j !== -1 &&
          indentOf(ctx.lines[j]) === indent &&
          ctx.lines[j].trimStart().startsWith('- ')
        ) {
          const { value, next } = parseSequence(ctx, j, indent);
          out[key] = value;
          i = next;
          continue;
        }
        out[key] = null;
        i += 1;
        continue;
      }
      const { value, next } = parseBlock(ctx, j, indentOf(ctx.lines[j]));
      out[key] = value;
      i = next;
      continue;
    }

    out[key] = parseScalar(rest);
    i += 1;
  }

  return { value: out, next: i };
}

function parseSequence(ctx, start, indent) {
  const out = [];
  let i = start;

  while (i < ctx.lines.length) {
    if (isSkippable(ctx.lines[i])) {
      i += 1;
      continue;
    }
    const line = ctx.lines[i];
    const ind = indentOf(line);
    if (ind < indent) break;
    if (ind > indent) {
      throw new YamlError(`${ctx.file}: unexpected indentation in sequence`, i);
    }

    const body = line.slice(indent);
    if (!body.startsWith('- ') && body !== '-') break;

    const inline = body === '-' ? '' : body.slice(2);

    // A sequence entry whose payload is `key: value` opens a compact mapping
    // whose remaining keys are indented to the payload column (indent + 2).
    if (inline !== '' && KEY_RE.test(inline)) {
      // Rewrite the entry line so the payload aligns at indent + 2, then parse
      // it as an ordinary mapping. Length is preserved, so line numbers hold.
      const saved = ctx.lines[i];
      ctx.lines[i] = ' '.repeat(indent + 2) + inline;
      const { value, next } = parseMapping(ctx, i, indent + 2);
      ctx.lines[i] = saved;
      out.push(value);
      i = next;
      continue;
    }

    if (inline === '') {
      const j = nextMeaningful(ctx, i + 1);
      if (j !== -1 && indentOf(ctx.lines[j]) > indent) {
        const { value, next } = parseBlock(ctx, j, indentOf(ctx.lines[j]));
        out.push(value);
        i = next;
        continue;
      }
      out.push(null);
      i += 1;
      continue;
    }

    out.push(parseScalar(inline));
    i += 1;
  }

  return { value: out, next: i };
}

/**
 * Literal block scalar. The content indent is taken from the first non-blank
 * line; that prefix is stripped from every line so nested indentation survives.
 */
function parseBlockScalar(ctx, start, parentIndent, marker) {
  const collected = [];
  let contentIndent = null;
  let i = start;

  for (; i < ctx.lines.length; i += 1) {
    const line = ctx.lines[i];
    if (line == null) continue;
    if (line.trim() === '') {
      collected.push('');
      continue;
    }
    const ind = indentOf(line);
    if (ind <= parentIndent) break;
    if (contentIndent == null) contentIndent = ind;
    collected.push(line.slice(Math.min(contentIndent, ind)));
  }

  // Trailing blank lines belong to the next node, not this scalar.
  while (collected.length && collected[collected.length - 1] === '') collected.pop();

  let value = collected.join('\n');
  if (marker === '|' || marker === '|+') value += '\n';
  // `|-` strips the final newline: nothing to add.

  return { value, next: i };
}

function parseScalar(raw) {
  const s = raw.trim();

  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    const inner = s.slice(1, -1);
    return s[0] === '"' ? unescapeDouble(inner) : inner.replace(/''/g, "'");
  }

  // Strip a trailing line comment from a bare scalar (` # ...`).
  const hash = s.indexOf(' #');
  const bare = hash === -1 ? s : s.slice(0, hash).trim();

  if (bare === 'true') return true;
  if (bare === 'false') return false;
  if (bare === 'null' || bare === '~' || bare === '') return null;
  if (/^-?\d+$/.test(bare)) return Number.parseInt(bare, 10);
  if (/^-?\d+\.\d+$/.test(bare)) return Number.parseFloat(bare);

  return bare;
}

function unescapeDouble(s) {
  return s.replace(/\\(["\\/nrt])/g, (_, c) => {
    switch (c) {
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      default:
        return c;
    }
  });
}
