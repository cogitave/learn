import { join, dirname } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

// ---------------------------------------------------------------------------
// includes + snippets
// ---------------------------------------------------------------------------

export function loadInclude(doc, includePath, { ROOT, err }) {
  const abs = join(ROOT, dirname(doc.rel), includePath);
  if (!existsSync(abs)) {
    err('broken-link', doc.rel, `include does not resolve: ${includePath}`);
    return null;
  }
  return readFileSync(abs, 'utf8');
}

/**
 * Snippet resolution is anchored at the CONFIG directory (the learn root), not
 * at the learn-pr loader's `src`. docs.config.json says `resolveSourceFrom:
 * "contentRoot"`, which taken literally resolves `snippets/...` to
 * `cogitave/snippets/...` - a directory that does not exist, while the registry
 * actually lives at `<learn>/snippets/`. See docs/build-v0.md, deviation D2.
 */
export function makeSnippetResolver(doc, { ROOT, err }) {
  return ({ source, id, range }) => {
    const abs = join(ROOT, source);
    if (!existsSync(abs)) {
      err('broken-link', doc.rel, `:::code source does not resolve: ${source}`);
      return null;
    }
    const text = readFileSync(abs, 'utf8');
    if (id) {
      const open = new RegExp(`^.*<${id}>.*$`, 'm');
      const close = new RegExp(`^.*</${id}>.*$`, 'm');
      const o = open.exec(text);
      const c = close.exec(text);
      if (!o || !c) {
        err('broken-link', doc.rel, `:::code region '${id}' not found in ${source}`);
        return null;
      }
      const start = o.index + o[0].length + 1;
      const body = text.slice(start, c.index).replace(/\n+$/, '');
      return dedent(body);
    }
    if (range) {
      const [a, b] = range.split('-').map((n) => Number.parseInt(n, 10));
      return dedent(text.split(/\r?\n/).slice(a - 1, b).join('\n'));
    }
    return text.trimEnd();
  };
}

export function dedent(s) {
  const lines = s.split(/\r?\n/);
  const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n').trim();
}
