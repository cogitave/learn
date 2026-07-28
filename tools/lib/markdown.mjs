/**
 * Minimal CommonMark subset + the Learn authoring extensions the corpus uses.
 *
 * Implemented (because the content set uses them):
 *   ATX headings, fenced code, unordered/ordered lists, blockquotes,
 *   alerts (`> [!NOTE|TIP|IMPORTANT|WARNING|CAUTION]`), thematic breaks,
 *   pipe tables, paragraphs, inline code/bold/em/links, `@uid` xrefs,
 *   `:::code ... :::` snippet-by-reference, `::: moniker range="..."` blocks,
 *   and `# [Label](#tab/id)` tab groups.
 *
 * Not implemented (absent from the corpus): setext headings, reference links,
 * `:::image`, HTML passthrough, footnotes, nested blockquotes. Anything
 * unrecognized renders as a paragraph rather than being dropped, so content
 * never silently disappears.
 *
 * Per ADR-0003 this is written from scratch; the authoring guide is the spec.
 */

import { icon } from './icons.mjs';

const ALERT_KINDS = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']);
const TAB_HEAD = /^#\s+\[([^\]]*)\]\(#tab\/([^)]+)\)\s*$/;
const TABLE_DELIM = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @param {string} text
 * @param {{resolveSnippet?:Function, resolveXref?:Function, warn?:Function}} ctx
 */
export function renderMarkdown(text, ctx = {}) {
  const warn = ctx.warn ?? (() => {});
  const lines = String(text).split(/\r?\n/);
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed === '') {
      i += 1;
      continue;
    }

    // --- fenced code -----------------------------------------------------
    const fence = /^(`{3,}|~{3,})\s*([A-Za-z0-9_+-]*)\s*$/.exec(trimmed);
    if (fence) {
      const [, marker, lang] = fence;
      const body = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== marker) {
        body.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) warn(`unclosed code fence opened with '${marker}'`);
      i += 1;
      out.push(codeBlock(body.join('\n'), lang));
      continue;
    }

    // --- :::code (single-line snippet reference) --------------------------
    if (trimmed.startsWith(':::code')) {
      out.push(renderSnippet(trimmed, ctx, warn));
      i += 1;
      continue;
    }

    // --- ::: moniker range="..." ... ::: ----------------------------------
    const moniker = /^:::\s*moniker\s+range="([^"]+)"\s*$/.exec(trimmed);
    if (moniker) {
      const body = [];
      i += 1;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t === ':::' || t === ':::moniker-end') break;
        body.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) warn(`unclosed moniker block (range="${moniker[1]}")`);
      i += 1;
      out.push(
        `<div class="moniker" data-range="${escapeHtml(moniker[1])}">` +
          `<p class="moniker-label">Applies to <code>${escapeHtml(moniker[1])}</code></p>` +
          renderMarkdown(body.join('\n'), ctx) +
          `</div>`,
      );
      continue;
    }

    // --- tab group: # [Label](#tab/id) ... until --- ------------------------
    if (TAB_HEAD.test(trimmed)) {
      const tabs = [];
      while (i < lines.length) {
        const head = TAB_HEAD.exec(lines[i].trim());
        if (!head) break;
        const [, label, id] = head;
        const body = [];
        i += 1;
        while (i < lines.length) {
          const t = lines[i].trim();
          if (TAB_HEAD.test(t) || t === '---') break;
          body.push(lines[i]);
          i += 1;
        }
        tabs.push({ label, id, html: renderMarkdown(body.join('\n'), ctx) });
      }
      if (i < lines.length && lines[i].trim() === '---') i += 1; // terminator
      out.push(tabGroup(tabs));
      continue;
    }

    // --- pipe table ---------------------------------------------------------
    // A table is a header row followed by a delimiter row; without the second
    // line the pipes are ordinary prose and fall through to the paragraph case.
    if (trimmed.includes('|') && i + 1 < lines.length && TABLE_DELIM.test(lines[i + 1].trim())) {
      const head = splitRow(trimmed);
      const align = splitRow(lines[i + 1].trim()).map((c) => {
        const left = c.startsWith(':');
        const right = c.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        return null;
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i].trim()));
        i += 1;
      }
      out.push(table(head, align, rows, ctx));
      continue;
    }

    // --- thematic break -----------------------------------------------------
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      out.push('<hr />');
      i += 1;
      continue;
    }

    // --- blockquote / alert -------------------------------------------------
    if (trimmed.startsWith('>')) {
      const body = [];
      let kind = null;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const content = lines[i].trim().replace(/^>\s?/, '');
        const alert = /^\[!([A-Z]+)\]\s*$/.exec(content.trim());
        if (alert && ALERT_KINDS.has(alert[1]) && kind === null && body.length === 0) {
          kind = alert[1];
        } else {
          body.push(content);
        }
        i += 1;
      }
      const inner = renderMarkdown(body.join('\n'), ctx);
      out.push(kind ? alert(kind, inner) : `<blockquote>${inner}</blockquote>`);
      continue;
    }

    // --- ATX heading ---------------------------------------------------------
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const content = heading[2].replace(/\s+#+\s*$/, '');
      const slug = slugify(content);
      // A hover-revealed anchor on section headings, so a reader can grab a link
      // to exactly the part they mean. Only h2/h3 - the ranks the on-page rail
      // lists; the h1 is the page and needs no fragment. The heading text is the
      // label the aria-label restates, so the mark is an affordance beside a
      // labelled heading, not meaning carried by an icon alone.
      const anchor =
        level === 2 || level === 3
          ? `<a class="h-anchor" href="#${slug}" aria-label="Link to this section">${icon('hash')}</a>`
          : '';
      out.push(`<h${level} id="${slug}">${renderInline(content, ctx)}${anchor}</h${level}>`);
      i += 1;
      continue;
    }

    // --- lists ----------------------------------------------------------------
    if (/^([-*+]|\d+\.)\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t === '') {
          const j = nextNonBlank(lines, i);
          if (j === -1 || !/^([-*+]|\d+\.)\s+/.test(lines[j].trim())) break;
          i = j;
          continue;
        }
        const item = /^([-*+]|\d+\.)\s+(.*)$/.exec(t);
        if (!item) {
          if (!items.length) break;
          items[items.length - 1] += ' ' + t; // lazy continuation
          i += 1;
          continue;
        }
        items.push(item[2]);
        i += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((t) => `<li>${renderInline(t, ctx)}</li>`).join('')}</${tag}>`);
      continue;
    }

    // --- paragraph -------------------------------------------------------------
    const para = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === '' || startsBlock(t)) break;
      para.push(t);
      i += 1;
    }
    if (para.length) out.push(`<p>${renderInline(para.join(' '), ctx)}</p>`);
  }

  return out.join('\n');
}

function nextNonBlank(lines, from) {
  let j = from;
  while (j < lines.length && lines[j].trim() === '') j += 1;
  return j < lines.length ? j : -1;
}

function startsBlock(t) {
  return (
    /^(`{3,}|~{3,})/.test(t) ||
    t.startsWith(':::') ||
    t.startsWith('>') ||
    /^#{1,6}\s/.test(t) ||
    /^([-*+]|\d+\.)\s+/.test(t) ||
    /^(-{3,}|\*{3,}|_{3,})$/.test(t)
  );
}

/**
 * A callout is a labelled band, not a tinted box: a rule above, a monospaced
 * label in a fixed gutter, the prose in the measure. Kind is carried by the
 * mark and the word, so the page stays monochrome; the two hazard kinds invert
 * their label so a reader cannot skim past them.
 */
function alert(kind, inner) {
  const k = kind.toLowerCase();
  return (
    `<div class="alert alert-${k}">` +
    `<p class="alert-label">${icon(k)}<span>${escapeHtml(kind)}</span></p>` +
    `<div class="alert-body">${inner}</div>` +
    `</div>`
  );
}

/** `| a | b |` -> ['a', 'b'], tolerating the optional leading/trailing pipe. */
function splitRow(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function table(head, align, rows, ctx) {
  const cell = (tag, text, n) => {
    const a = align[n] ? ` style="text-align:${align[n]}"` : '';
    return `<${tag}${a}>${renderInline(text ?? '', ctx)}</${tag}>`;
  };
  const thead = `<thead><tr>${head.map((c, n) => cell('th', c, n)).join('')}</tr></thead>`;
  const tbody = rows.length
    ? `<tbody>${rows
        .map((r) => `<tr>${head.map((_, n) => cell('td', r[n], n)).join('')}</tr>`)
        .join('')}</tbody>`
    : '';
  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}

/**
 * Code is always framed: a bar carrying the language, the source when the block
 * came from the snippet registry, and a copy control. The control is inert
 * without JavaScript and the code itself stays selectable, so nothing is lost.
 */
function codeBlock(code, lang, source) {
  // A diagram is a picture, not a listing. The source stays in the DOM, so
  // without scripting the reader still gets the definition rather than nothing.
  if (lang === 'mermaid') {
    return (
      `<figure class="diagram">` +
      `<div class="diagram-scroll"><pre class="mermaid">${escapeHtml(code)}</pre></div>` +
      `<figcaption>Diagram</figcaption>` +
      `</figure>`
    );
  }
  const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
  const bar =
    `<div class="code-bar">` +
    `<span class="code-lang">${escapeHtml(lang || 'text')}</span>` +
    `<span class="code-source">${source ? escapeHtml(source) : ''}</span>` +
    `<button class="code-copy" type="button" aria-label="Copy code">` +
    `${icon('copy', { class: 'i-copy' })}${icon('check', { class: 'i-check' })}</button>` +
    `</div>`;
  return `<div class="code">${bar}<pre><code${cls}>${escapeHtml(code)}</code></pre></div>`;
}

function tabGroup(tabs) {
  if (!tabs.length) return '';
  const heads = tabs
    .map(
      (t, n) =>
        `<button class="tab-head${n === 0 ? ' is-active' : ''}" data-tab="${escapeHtml(t.id)}">` +
        `${escapeHtml(t.label)}</button>`,
    )
    .join('');
  const panels = tabs
    .map(
      (t, n) =>
        `<div class="tab-panel${n === 0 ? ' is-active' : ''}" data-tab="${escapeHtml(t.id)}">${t.html}</div>`,
    )
    .join('');
  return `<div class="tabs"><div class="tab-heads">${heads}</div>${panels}</div>`;
}

function renderSnippet(directive, ctx, warn) {
  const attr = (name) => {
    const m = new RegExp(`${name}="([^"]*)"`).exec(directive);
    return m ? m[1] : null;
  };
  const source = attr('source');
  const id = attr('id');
  const range = attr('range');
  const lang = attr('language') ?? '';

  const fallback = `<div class="code code-missing"><pre><code>${escapeHtml(directive)}</code></pre></div>`;

  if (!source) {
    warn(`:::code directive without a source: ${directive}`);
    return fallback;
  }
  if (!ctx.resolveSnippet) {
    warn(`no snippet resolver configured; cannot resolve '${source}'`);
    return fallback;
  }

  const resolved = ctx.resolveSnippet({ source, id, range, lang });
  // The resolver reports its own specific failure; null means "already logged".
  if (resolved == null) return fallback;

  return codeBlock(resolved, lang, id ? `${source}#${id}` : source);
}

/** Inline rendering. Code spans are extracted first so nothing rewrites them. */
export function renderInline(text, ctx = {}) {
  const spans = [];

  // NUL sentinels cannot occur in source text and pass through escapeHtml
  // untouched, so restoring them cannot collide with ordinary prose. A plain
  // ` 5 ` placeholder would have matched text such as "in 5 minutes".
  let s = String(text).replace(/`([^`]+)`/g, (_, code) => {
    spans.push(code);
    return ` ${spans.length - 1} `;
  });

  s = escapeHtml(s);

  // [text](url) - both sides are already escaped, so this is attribute-safe.
  // A link resolver, when configured, rewrites an intra-corpus source path
  // (`what-is-namzu.md`) to the page it becomes, and neutralizes a link that
  // points outside the published corpus (a source-repo path, an ADR) to plain
  // text - the estate is not a website, so those hrefs would only 404.
  s = s.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (_, label, href) => {
    if (ctx.resolveLink) {
      const resolved = ctx.resolveLink(href);
      if (resolved == null) return label;
      return `<a href="${resolved}">${label}</a>`;
    }
    return `<a href="${href}">${label}</a>`;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?![*\w])/g, '$1<em>$2</em>');

  // @uid cross-references, e.g. @cogitave.learn.get-started-with-yuva
  s = s.replace(/@([a-z][a-z0-9]*(?:[.\-][a-z0-9-]+){2,})/g, (whole, uid) => {
    const target = ctx.resolveXref ? ctx.resolveXref(uid) : null;
    if (!target) return whole;
    return `<a class="xref" href="${target.href}">${escapeHtml(target.title ?? uid)}</a>`;
  });

  return s.replace(/ (\d+) /g, (_, n) => `<code>${escapeHtml(spans[Number(n)])}</code>`);
}
