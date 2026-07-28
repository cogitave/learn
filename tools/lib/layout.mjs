/**
 * Page shell for learn.cogitave.com.
 *
 * Every emitted page is assembled here, so the chrome (masthead, side
 * navigation, on-page rail, footer) is defined once and cannot drift between
 * page kinds. `build.mjs` supplies a navigation model and a body; this module
 * owns the document.
 *
 * The visual contract is docs/design-language.md. Two rules from it are load
 * bearing in this file and should not be "improved" casually:
 *   - the type scale is 12 / 13 / 14 / 24 px only, so heading rank is carried by
 *     weight, colour, and rules rather than by size;
 *   - the layout is a three-track grid (side nav / article / on-page rail) that
 *     degrades to one track, matching the reference docs surfaces.
 *
 * Zero dependencies, per ADR-0003.
 */

import { escapeHtml } from './markdown.mjs'
import { icon } from './icons.mjs'

const SITE = 'Cogitave Learn'

// The stylesheet and script are content-hashed at build time, so a deploy
// serves a new URL rather than a stale cached copy of a stable name (a hashless
// `style.css` sits in the CDN for hours after its bytes change). build.mjs fills
// these in before rendering; fonts keep fixed names, since their bytes never
// change.
let ASSETS = { css: '/assets/style.css', js: '/assets/app.js' }
export function setAssets(a) {
  ASSETS = { ...ASSETS, ...a }
}

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

export const minutes = (n) => (n ? `${n} min` : '')

const attr = (s) => escapeHtml(String(s ?? ''))

/** Strip tags from rendered inline HTML so it is safe as a plain-text label.
 * The removal is repeated to a fixed point: a single pass over `<[^>]*>` can
 * leave a tag behind when one is nested inside another (`<<b>script>`), so loop
 * until nothing more matches before decoding the one entity we re-expand. */
export const stripTags = (html) => {
  let s = String(html)
  let prev
  do {
    prev = s
    s = s.replace(/<[^>]*>/g, '')
  } while (s !== prev)
  return s.replace(/&amp;/g, '&').trim()
}

/**
 * Pull the h2/h3 rank out of already-rendered article HTML. The renderer emits
 * stable slug ids, so the rail links to the same anchors a reader can copy.
 */
export function extractToc(html) {
  const items = []
  const re = /<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g
  let m
  while ((m = re.exec(html)) !== null) {
    items.push({ level: Number(m[1]), id: m[2], text: stripTags(m[3]) })
  }
  return items
}

// ---------------------------------------------------------------------------
// chrome
// ---------------------------------------------------------------------------

/**
 * The masthead is two tiers, the way every documentation surface worth copying
 * builds one. The upper tier is the whole property and never changes; the lower
 * tier is the section you are inside and changes with it. One tier cannot do
 * both jobs: it either lists everything and stops being navigable, or lists the
 * top level and leaves you with no way across the section you are actually in.
 */
function masthead(nav, section, hasSide, hideSearch) {
  const item = (label, href, key) =>
    `<a class="topnav-item${section === key ? ' is-current' : ''}" href="${attr(href)}"` +
    `${section === key ? ' aria-current="page"' : ''}>${escapeHtml(label)}</a>`

  const links = [
    nav.docs.length ? item('Documentation', '/documentation/', 'docs') : '',
    nav.paths.length || nav.modules.length ? item('Training', '/training/', 'training') : '',
    item('Browse', '/browse/', 'browse'),
  ].join('')

  return `<header class="topbar">
  <div class="topbar-in">
    ${
      // No control without something to control: an index page has no section
      // navigation, so it must not offer a button that does nothing.
      hasSide
        ? `<button class="icon-btn topbar-burger" type="button" aria-expanded="false" aria-controls="sidenav" aria-label="Open section navigation">${icon('menu')}</button>`
        : ''
    }
    <a class="brand" href="/"><span class="brand-mark">Cogitave</span><span class="brand-sub">Learn</span></a>
    <nav class="topnav" aria-label="Property">${links}</nav>
    <div class="topbar-end">
      ${hideSearch ? '' : searchBox('q', 'Search', 'search-compact')}
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch theme">${icon('sun', { class: 'i-light' })}${icon('moon', { class: 'i-dark' })}</button>
    </div>
  </div>
  ${subbar(nav, section)}
</header>`
}

/** The contextual tier: where you are, and everything else at that level. */
function subbar(nav, section) {
  const SECTIONS = {
    docs: {
      title: 'Documentation',
      href: '/documentation/',
      links: [
        ['All documentation', '/documentation/'],
        ...(nav.docTypes ?? []).map((t) => [t.title, t.href]),
      ],
    },
    training: {
      title: 'Training',
      href: '/training/',
      links: [
        ['All training', '/training/'],
        ['Learning paths', '/training/#paths'],
        ['Modules', '/training/#modules'],
      ],
    },
    browse: {
      title: 'Browse',
      href: '/browse/',
      links: [
        ['Products', '/browse/#product'],
        ['Roles', '/browse/#role'],
        ['Levels', '/browse/#level'],
        ['Subjects', '/browse/#subject'],
        ['Everything', '/browse/#everything'],
      ],
    },
  }

  const s = SECTIONS[section]
  if (!s) return ''
  return `<div class="subbar">
    <div class="subbar-in">
      <a class="subbar-title" href="${attr(s.href)}">${escapeHtml(s.title)}</a>
      <nav class="subnav" aria-label="${attr(s.title)}">${s.links
        .map(([label, href]) => `<a href="${attr(href)}">${escapeHtml(label)}</a>`)
        .join('')}</nav>
    </div>
  </div>`
}

/** One search control, used compact in the masthead and large on the home page. */
function searchBox(id, placeholder, cls) {
  return `<div class="search ${cls}" role="search" data-search>
    <label class="search-field">
      ${icon('search')}
      <input id="${attr(id)}" type="search" autocomplete="off" spellcheck="false" placeholder="${attr(placeholder)}" aria-label="Search Cogitave Learn" aria-expanded="false" aria-controls="${attr(id)}-results" role="combobox" />
      <kbd class="search-key">/</kbd>
    </label>
    <div id="${attr(id)}-results" class="search-results" role="listbox" hidden></div>
  </div>`
}

export const heroSearch = () => searchBox('q-hero', 'Search documentation and training', 'search-hero')

function footer(nav) {
  const column = (heading, items, iconName) =>
    items.length
      ? `<div class="foot-col">
      <p class="foot-head">${icon(iconName)}${escapeHtml(heading)}</p>
      <ul>${items
        .slice(0, 6)
        .map((i) => `<li><a href="${attr(i.href)}">${escapeHtml(i.title)}</a></li>`)
        .join('')}</ul>
    </div>`
      : ''

  return `<footer class="sitefoot">
  <div class="foot-in">
    <div class="foot-brand">
      <a class="brand" href="/"><span class="brand-mark">Cogitave</span><span class="brand-sub">Learn</span></a>
      <p>The knowledge surface for the Cogitave estate: product documentation, guided learning, and the standards everything here is built to.</p>
    </div>
    <nav class="foot-cols" aria-label="Footer">
      ${column('Browse by product', nav.products ?? [], 'path')}
      ${column('Learning paths', nav.paths, 'path')}
      ${column('Modules', nav.modules, 'module')}
      ${column('Documentation', nav.docs, 'doc')}
    </nav>
  </div>
  <div class="foot-base">
    <span>Built from <code>cogitave/learn</code>.</span>
    <span>Content, engine, and design are Cogitave's own.</span>
  </div>
</footer>`
}

function breadcrumbs(items) {
  if (!items.length) return ''
  const sep = `<span class="crumb-sep">${icon('chevronRight')}</span>`
  const inner = items
    .map((c, n) => {
      const last = n === items.length - 1
      return c.href && !last
        ? `<a href="${attr(c.href)}">${escapeHtml(c.label)}</a>`
        : `<span${last ? ' aria-current="page"' : ''}>${escapeHtml(c.label)}</span>`
    })
    .join(sep)
  return `<nav class="crumbs" aria-label="Breadcrumb">${inner}</nav>`
}

/**
 * Section navigation. `model` is the unit rank of the module (or the module
 * rank of a path) the reader is currently inside; there is no global tree,
 * because a docs tree that lists everything is noise at this corpus size.
 */
/**
 * Section navigation: the whole set you are inside, grouped, filterable, with
 * the current entry marked. A tree that only lists the siblings of the page you
 * are on stops being navigation the moment the corpus grows past one module,
 * so a group carries its own heading and can be collapsed.
 */
function sidenav(model) {
  if (!model) return ''
  const groups = model.groups ?? [{ items: model.items ?? [] }]
  const flat = groups.flatMap((g) => g.items)
  const numbered = model.numbered !== false

  const row = (it, n) =>
    `<li><a class="sidenav-item${numbered ? '' : ' is-plain'}${it.current ? ' is-current' : ''}" href="${attr(it.href)}"` +
    `${it.current ? ' aria-current="page"' : ''} data-title="${attr(it.title.toLowerCase())}">` +
    (numbered ? `<span class="sidenav-no">${String(n + 1).padStart(2, '0')}</span>` : '') +
    `<span class="sidenav-label">${escapeHtml(it.title)}</span>` +
    (it.meta ? `<span class="sidenav-meta">${escapeHtml(it.meta)}</span>` : '') +
    `</a></li>`

  const body = groups
    .map((g) => {
      const rows = g.items.map((it, n) => row(it, n)).join('')
      const open = g.items.some((i) => i.current) || g.open !== false
      return g.title
        ? `<details class="sidenav-group"${open ? ' open' : ''}>
        <summary>${icon('chevronDown', { class: 'sidenav-caret' })}<span>${escapeHtml(g.title)}</span>
        <span class="sidenav-group-count">${g.items.length}</span></summary>
        <ol class="sidenav-list">${rows}</ol>
      </details>`
        : `<ol class="sidenav-list">${rows}</ol>`
    })
    .join('')

  const at = flat.findIndex((i) => i.current)
  const done = at === -1 ? 0 : at + 1
  const pct = flat.length ? Math.round((done / flat.length) * 100) : 0

  return `<aside id="sidenav" class="sidenav" aria-label="${attr(model.label ?? 'Section')}">
  <div class="sidenav-in">
    <a class="sidenav-parent" href="${attr(model.href)}">${icon('arrowLeft')}<span>${escapeHtml(model.title)}</span></a>
    ${
      flat.length >= 5
        ? `<label class="sidenav-filter">${icon('search')}
      <input type="search" placeholder="Find by title" aria-label="Filter this section" data-sidenav-filter autocomplete="off" />
    </label>`
        : ''
    }
    ${
      model.progress && done
        ? `<div class="progress" role="img" aria-label="Unit ${done} of ${flat.length} in this module">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p class="progress-label">Unit ${done} of ${flat.length}</p>
    </div>`
        : ''
    }
    ${body}
    <p class="sidenav-empty" hidden>No match in this section.</p>
  </div>
</aside>`
}

function rail(toc) {
  if (!toc.length) return '<div class="rail" aria-hidden="true"></div>'
  const rows = toc
    .map(
      (t) =>
        `<li class="rail-l${t.level}"><a href="#${attr(t.id)}" data-toc="${attr(t.id)}">${escapeHtml(t.text)}</a></li>`,
    )
    .join('')
  return `<aside class="rail" aria-label="On this page">
  <nav class="rail-in">
    <p class="rail-head">On this page</p>
    <ul class="rail-list">${rows}</ul>
  </nav>
</aside>`
}

// ---------------------------------------------------------------------------
// content blocks shared by more than one page kind
// ---------------------------------------------------------------------------

/** @param {{href:string,title:string,summary?:string,meta?:string[],icon?:string}} c */
export function card(c) {
  const meta = (c.meta ?? []).filter(Boolean)
  return `<li class="card"><a href="${attr(c.href)}">
    <span class="card-icon">${icon(c.icon ?? 'module', { size: 20 })}</span>
    <span class="card-body">
      <span class="card-title">${escapeHtml(c.title)}</span>
      ${c.summary ? `<span class="card-summary">${escapeHtml(c.summary)}</span>` : ''}
      ${meta.length ? `<span class="card-meta">${meta.map((m) => `<span>${escapeHtml(m)}</span>`).join('')}</span>` : ''}
    </span>
    <span class="card-go">${icon('arrowRight')}</span>
  </a></li>`
}

export const cardGrid = (cards) => `<ul class="cards">${cards.join('')}</ul>`

/**
 * The landing card: a heading, a promise, a short rank of real entries, and one
 * way deeper. Three of these carry a home page far better than three identical
 * card grids, because they say what each region is FOR before listing it.
 */
export function linkCard(c) {
  return `<li class="lcard">
    <p class="lcard-title">${escapeHtml(c.title)}</p>
    <p class="lcard-desc">${escapeHtml(c.description)}</p>
    <ul class="lcard-list">${c.items
      .map(
        (i) =>
          `<li><a href="${attr(i.href)}"><span class="lcard-mark">${icon(i.icon ?? 'doc', { size: 20 })}</span>` +
          `<span>${escapeHtml(i.label)}</span></a></li>`,
      )
      .join('')}</ul>
    <a class="lcard-more" href="${attr(c.moreHref)}">${escapeHtml(c.moreLabel)} ${icon('arrowRight')}</a>
  </li>`
}

export const linkCards = (cards) => `<ul class="lcards">${cards.join('')}</ul>`

/**
 * The taxonomy, set as an index rather than a tag cloud.
 *
 * A row of pills gives every value the same weight, leaves the right half of
 * the page empty, and reads as metadata that escaped onto the page. An index
 * has a spine: the axis sits in a fixed gutter, its values run as ruled rows
 * with the count set right, and the row itself is the target. The hover - the
 * row indenting while its arrow advances - is the Cogitave marketing surface's
 * own drill-down gesture, so the two properties move the same way.
 */
export function indexRank(axisName, items) {
  if (!items.length) return ''
  return `<div class="rank">
    <p class="rank-axis">${escapeHtml(axisName)}</p>
    <ul class="rank-rows">${items
      .map(
        (i) =>
          `<li><a href="${attr(i.href)}">` +
          `<span class="rank-name">${escapeHtml(i.label)}</span>` +
          `<span class="rank-count">${i.count}</span>` +
          `<span class="rank-go">${icon('arrowRight')}</span></a></li>`,
      )
      .join('')}</ul>
  </div>`
}

export const indexTable = (ranks) => `<div class="ranks">${ranks.filter(Boolean).join('')}</div>`

/** Prev / next inside a module. */
export function pager(prev, next) {
  if (!prev && !next) return ''
  const side = (doc, dir) =>
    doc
      ? `<a class="pager-link pager-${dir}" href="${attr(doc.href)}">
      <span class="pager-dir">${icon(dir === 'prev' ? 'arrowLeft' : 'arrowRight')}${dir === 'prev' ? 'Previous' : 'Next'}</span>
      <span class="pager-title">${escapeHtml(doc.title)}</span>
    </a>`
      : '<span></span>'
  return `<nav class="pager" aria-label="Unit">${side(prev, 'prev')}${side(next, 'next')}</nav>`
}

/** The badge / trophy note that closes a module or a path. */
export function awardNote(kind, title, summary) {
  return `<aside class="award">
  <span class="award-icon">${icon(kind === 'trophy' ? 'trophy' : 'badge', { size: 20 })}</span>
  <span class="award-body">
    <span class="award-label">${kind === 'trophy' ? 'Trophy' : 'Badge'}</span>
    <span class="award-title">${escapeHtml(title)}</span>
    ${summary ? `<span class="award-summary">${escapeHtml(summary)}</span>` : ''}
  </span>
</aside>`
}

/** Key/value strip under a module or path title. */
export function factRow(facts) {
  const cells = facts
    .filter((f) => f.value)
    .map(
      (f) =>
        `<div class="fact"><span class="fact-key">${icon(f.icon ?? 'clock')}${escapeHtml(f.key)}</span>` +
        `<span class="fact-value">${escapeHtml(f.value)}</span></div>`,
    )
    .join('')
  return cells ? `<div class="facts">${cells}</div>` : ''
}

/**
 * Clickable taxonomy chips under a title. Each value links to its `/browse`
 * facet page. The caller passes only values that actually have a facet page, so
 * a chip never lands on a 404 - the audience/product tags become navigation.
 */
export function chipRow(chips) {
  if (!chips || !chips.length) return ''
  return (
    `<nav class="chips" aria-label="Topics">` +
    chips.map((c) => `<a class="chip" href="${attr(c.href)}">${escapeHtml(c.label)}</a>`).join('') +
    `</nav>`
  )
}

/**
 * The page toolbar, above the title, the way modern AI-docs surfaces put it:
 *   - "Copy page" copies the page's authored markdown to the clipboard, to paste
 *     the whole page into an agent. It must fetch and write the clipboard, so it
 *     is script-only and hidden until app.js marks the document scripted.
 *   - "View as" opens the same page in a machine shape. With two formats it is a
 *     native <details> dropdown (works without JavaScript); with only JSON - a
 *     structural node with no prose body - it is a single link.
 * The page reads fine without either. Provenance that used to sit in the
 * colophon (edit-on-GitHub) is gone; feedback stays as "Report an issue" below.
 */
export function pageActions({ mdHref, jsonHref } = {}) {
  if (!mdHref && !jsonHref) return ''
  const copy = mdHref
    ? `<button class="copy-page" type="button" data-md="${attr(mdHref)}" aria-label="Copy this page as Markdown">` +
      `<span class="copy-page-mark">${icon('copy', { class: 'i-copy' })}${icon('check', { class: 'i-check' })}</span>` +
      `<span class="copy-page-label">Copy page</span></button>`
    : ''
  let viewAs = ''
  if (mdHref && jsonHref) {
    viewAs =
      `<details class="view-as">` +
      `<summary class="view-as-btn">View as${icon('chevronDown', { class: 'view-as-caret' })}</summary>` +
      `<div class="view-as-menu">` +
      `<a class="view-as-item" href="${attr(mdHref)}">${icon('markdown')}Markdown</a>` +
      `<a class="view-as-item" href="${attr(jsonHref)}">${icon('braces')}JSON</a>` +
      `</div></details>`
  } else if (jsonHref) {
    viewAs = `<a class="view-as-single" href="${attr(jsonHref)}">${icon('braces')}View as JSON</a>`
  }
  return `<div class="page-actions">${copy}${viewAs}</div>`
}

const LEARN_REPO = 'https://github.com/cogitave/learn'

/**
 * The page-meta strip that closes a content page - kept deliberately minimal: a
 * way to flag a problem, and when the page was last updated. The machine shapes
 * (markdown, JSON) live in the page toolbar at the top now, where a reader looks
 * for them; an edit link is not the pattern a polished product surface uses.
 * The Updated stamp is a record, not a link: monospace, demoted to the far edge.
 */
export function colophon({ uid, reviewed, title } = {}) {
  const report = `<a class="colophon-link" href="${LEARN_REPO}/issues/new?title=${encodeURIComponent(`Docs feedback: ${title ?? uid ?? ''}`)}">${icon('comment')}Report an issue</a>`
  const stamp = reviewed ? `<span class="colophon-stamp">Updated ${attr(reviewed)}</span>` : ''
  return `<aside class="colophon" aria-label="Page information">${report}${stamp}</aside>`
}

// ---------------------------------------------------------------------------
// document
// ---------------------------------------------------------------------------

/**
 * @param {{
 *   title: string, description?: string, body: string,
 *   nav: {paths: any[], modules: any[], docs: any[]},
 *   breadcrumb?: {label: string, href?: string}[],
 *   sidenav?: any, toc?: any[], section?: string, layout?: 'article'|'wide',
 * }} o
 */
export function shell(o) {
  const layout = o.layout ?? 'article'
  // A rail with a single entry is a label, not navigation: it costs a whole
  // column and tells the reader nothing they cannot already see.
  const toc = (o.toc ?? []).length > 1 ? o.toc : []
  const hasSide = Boolean(o.sidenav)

  return `<!doctype html>
<html lang="en" data-layout="${layout}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(o.title)} | ${SITE}</title>
${o.description ? `<meta name="description" content="${attr(o.description)}" />` : ''}
<meta name="color-scheme" content="light dark" />
<link rel="preload" href="/assets/fonts/cg-pro-display-500.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/cg-pro-text-400.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/assets/fonts/cg-pro-text-500.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="${ASSETS.css}" />
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Organization","name":"Cogitave","url":"https://learn.cogitave.com/"},{"@type":"WebSite","name":"Cogitave Learn","url":"https://learn.cogitave.com/"}]}</script>
<script>
/* Resolve the stored theme before first paint so the page never flashes, and
   mark the document as scripted so progressive-enhancement fallbacks retract. */
document.documentElement.classList.add('js');
try{var t=localStorage.getItem('cogitave-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${masthead(o.nav, o.section, hasSide, o.hideHeaderSearch)}
<div class="shell${hasSide ? '' : ' shell-nosidenav'}${toc.length ? '' : ' shell-notoc'}">
${hasSide ? sidenav(o.sidenav) : ''}
<main id="main" class="content" tabindex="-1">
${breadcrumbs(o.breadcrumb ?? [])}
${o.body}
${o.colophon ?? ''}
</main>
${layout === 'article' ? rail(toc) : ''}
</div>
${footer(o.nav)}
<script src="${ASSETS.js}" defer></script>
</body>
</html>
`
}
