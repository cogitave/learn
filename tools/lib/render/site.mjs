import { join, dirname, relative, resolve, sep } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

import { slugify } from '../markdown.mjs';
import { icon } from '../icons.mjs';
import { card, minutes } from '../layout.mjs';
import { makeSnippetResolver } from '../includes.mjs';

// ---------------------------------------------------------------------------
// EMIT
// ---------------------------------------------------------------------------

export function writePage(outDir, href, html) {
  const dir = join(outDir, href.replace(/^\//, '').replace(/\/$/, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

/**
 * The shared view-model for the render pass. It is built once from the linked
 * graph and threaded into each renderer, so the publication gate, the per-doc
 * render context, the title/summary/duration accessors, the taxonomy/facets,
 * the nav and sidenavs, and the two growing projection arrays (index/api) are
 * all computed exactly once and seen identically by every page.
 */
export function buildViewModel({ docs, byUid, achievements, ROOT, reporter }) {
  const { err, warn } = reporter;

  // Every page that actually publishes, keyed by the source path it was built
  // from, so a relative Markdown link between authored pages resolves to the URL
  // the target becomes. A unique basename is a second key, because unit prose
  // lives one directory deeper (in includes/) than the .yml it renders under.
  const publishable = docs.filter((d) => d.href && !(d.kind === 'doc' && d.meta?.visibility === 'internal'));
  const relToHref = new Map(publishable.map((d) => [d.rel, d.href]));
  const baseSeen = new Map();
  for (const d of publishable) {
    const base = d.rel.split('/').pop();
    baseSeen.set(base, (baseSeen.get(base) ?? 0) + 1);
  }
  const baseToHref = new Map();
  for (const d of publishable) {
    const base = d.rel.split('/').pop();
    if (baseSeen.get(base) === 1) baseToHref.set(base, d.href);
  }
  // Resolve a Markdown link href for the page rendered from `doc`. Returns a
  // rewritten in-corpus URL, the href unchanged (external / site-absolute /
  // anchor), or null to neutralize a link that leaves the published corpus
  // (a source-repo path, an ADR) - the estate is not a website, so such an href
  // would only 404. The renderer prints the link text instead.
  const linkResolverFor = (doc) => {
    const baseDir = dirname(doc.rel);
    return (href) => {
      if (/^(?:https?:|mailto:|tel:|\/\/|\/|#)/i.test(href)) return href;
      const hashAt = href.indexOf('#');
      const pathPart = hashAt >= 0 ? href.slice(0, hashAt) : href;
      const hash = hashAt >= 0 ? href.slice(hashAt) : '';
      if (!pathPart) return href;
      const rel = relative(ROOT, resolve(ROOT, baseDir, pathPart)).split(sep).join('/');
      const hit = relToHref.get(rel) ?? baseToHref.get(pathPart.split('/').pop());
      return hit ? hit + hash : null;
    };
  };
  const ctxFor = (doc) => ({
    resolveSnippet: makeSnippetResolver(doc, { ROOT, err }),
    resolveXref: (uid) => {
      const t = byUid.get(uid);
      return t ? { href: t.href, title: t.data?.title ?? uid } : null;
    },
    resolveLink: linkResolverFor(doc),
    warn: (m) => warn('render', doc.rel, m),
  });

  const paths = [...byUid.values()].filter((d) => d.kind === 'LearningPath');
  const modules = [...byUid.values()].filter((d) => d.kind === 'Module');
  const units = [...byUid.values()].filter((d) => d.kind === 'ModuleUnit');
  /**
   * Publication gate.
   *
   * A knowledge platform publishes what a READER needs: product documentation,
   * quickstarts, reference, concepts, training. It does not publish how the
   * platform itself is built - no vendor ships its own docs pipeline spec,
   * design language, or deviation register as reader-facing pages. Those are
   * engineering documents; they belong in the repository, reviewed like code.
   *
   * The gate is one front-matter field, so the decision lives with the document
   * and is visible in review: `visibility: internal` keeps a page in git and out
   * of `_site/`. Anything without the field publishes, which keeps the default
   * open and makes withholding an explicit act.
   */
  const allDocs = docs.filter((d) => d.kind === 'doc');
  const docPages = allDocs.filter((d) => d.meta.visibility !== 'internal');
  const withheld = allDocs.length - docPages.length;

  const rawTitle = (d) => (d.kind === 'doc' ? d.meta.title ?? d.srcRel : d.data.title);

  /**
   * Authors suffix doc titles with the site name so a search result carries its
   * own context. On the site that context is the site, so the suffix is the same
   * seven words repeated down every sidebar row, every card, and every browser
   * tab. It is dropped for display; only a TRAILING site name goes, so a title
   * that genuinely reads "... learn.cogitave.com in sync with the estate" is
   * left exactly as written.
   */
  // Built from a string so the source file stays ASCII: the class covers the
  // hyphen, en dash, em dash, and pipe an author might separate the suffix with.
  const SITE_SUFFIX = new RegExp('\\s*[-\u2013\u2014|]\\s*learn\\.cogitave\\.com\\s*$', 'i');
  const title = (d) => String(rawTitle(d)).replace(SITE_SUFFIX, '').trim();
  const summary = (d) => String((d.kind === 'doc' ? d.meta.description : d.data.summary) ?? '').trim();
  const unitsOf = (m) => (m.data.units ?? []).map((u) => byUid.get(u)).filter(Boolean);
  const modulesOf = (p) => (p.data.modules ?? []).map((u) => byUid.get(u)).filter(Boolean);
  const duration = (m) => unitsOf(m).reduce((n, u) => n + (u.data.durationInMinutes ?? 0), 0);

  /** The module rank a path owns, used for the "up" link on a module page. */
  const pathOf = (m) => paths.find((p) => (p.data.modules ?? []).includes(m.data.uid)) ?? null;

  // -------------------------------------------------------------------------
  // taxonomy
  //
  // The corpus already carries products / roles / levels / subjects on every
  // path, module, and doc. Those axes - not a hand-kept nav tree - are how the
  // site scales: a new product becomes a browse page the moment content
  // declares it, and nothing here needs to know its name in advance.
  // -------------------------------------------------------------------------

  const AXES = [
    { key: 'product', field: 'products', label: 'Product', plural: 'Products', icon: 'module' },
    { key: 'role', field: 'roles', label: 'Role', plural: 'Roles', icon: 'path' },
    { key: 'level', field: 'levels', label: 'Level', plural: 'Levels', icon: 'unit' },
    { key: 'subject', field: 'subjects', label: 'Subject', plural: 'Subjects', icon: 'doc' },
  ];

  // Slug -> display name. Only the cases title-casing gets wrong need an entry.
  const LABELS = {
    ai: 'AI',
    'artificial-intelligence': 'Artificial intelligence',
    'cogitave-core': 'Cogitave Core',
    devops: 'DevOps',
    mcp: 'MCP',
  };
  const label = (slug) =>
    LABELS[slug] ?? String(slug).replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

  const meta = (d) => (d.kind === 'doc' ? d.meta : d.data);
  const axisValues = (d, axis) => {
    const m = meta(d) ?? {};
    // Modules use the plural list; a doc page carries a single `level`.
    const raw = m[axis.field] ?? m[axis.key] ?? [];
    return (Array.isArray(raw) ? raw : [raw]).filter(Boolean).map(String);
  };

  const kindOf = (d) =>
    d.kind === 'LearningPath' ? 'Learning path' : d.kind === 'Module' ? 'Module' : 'Documentation';
  const iconOf = (d) =>
    d.kind === 'LearningPath' ? 'path' : d.kind === 'Module' ? 'module' : 'doc';

  /**
   * Internal building blocks are not products. They are tagged on content so the
   * estate can trace what teaches what, but a public knowledge platform does not
   * advertise its own substrate as something a reader can adopt - no vendor
   * publishes a landing page for the layer underneath its products. Pages tagged
   * only with these stay reachable; the value just does not become a facet.
   */
  const INTERNAL_PRODUCTS = new Set(['cogitave-core']);

  const catalogue = [...paths, ...modules, ...docPages];
  const facets = new Map(); // `${axis.key}/${value}` -> { axis, value, items[] }
  for (const d of catalogue) {
    for (const axis of AXES) {
      for (const v of axisValues(d, axis)) {
        if (axis.key === 'product' && INTERNAL_PRODUCTS.has(v)) continue;
        const id = `${axis.key}/${v}`;
        if (!facets.has(id)) facets.set(id, { axis, value: v, items: [] });
        facets.get(id).items.push(d);
      }
    }
  }

  const facetHref = (axisKey, value) => `/browse/${axisKey}/${slugify(value)}/`;
  const facetsOf = (axisKey) =>
    [...facets.values()]
      .filter((f) => f.axis.key === axisKey)
      .sort((a, b) => b.items.length - a.items.length || a.value.localeCompare(b.value))
      .map((f) => ({ label: label(f.value), href: facetHref(axisKey, f.value), count: f.items.length }));

  // Diataxis type is the durable grouping for reference material: a reader
  // looking for a how-to is not looking for an explanation, whatever it is about.
  // Reading order, not alphabetical order: a reader arriving cold wants the
  // tutorial, then the task, then the why, and reaches for reference last.
  const DOC_TYPES = ['tutorial', 'how-to', 'explanation', 'reference'];
  const docsOfType = (t) =>
    docPages
      .filter((d) => (d.meta.type ?? 'reference') === t)
      // `order` sequences a group where alphabetical is meaningless; anything
      // without it sorts after, then by title.
      .sort(
        (a, b) =>
          (a.meta.order ?? 100) - (b.meta.order ?? 100) || title(a).localeCompare(title(b)),
      );
  const docTypes = DOC_TYPES.filter((t) => docsOfType(t).length).map((t) => ({
    key: t,
    title: label(t),
    href: `/documentation/#${t}`,
    items: docsOfType(t),
  }));

  const nav = {
    paths: paths.map((p) => ({ href: p.href, title: title(p) })),
    modules: modules.map((m) => ({ href: m.href, title: title(m) })),
    // Reading order here too, so the footer agrees with the landing page.
    docs: docTypes.flatMap((t) => t.items).map((d) => ({ href: d.href, title: title(d) })),
    products: facetsOf('product').map((f) => ({ href: f.href, title: f.label })),
    docTypes: docTypes.map((t) => ({ title: t.title, href: t.href })),
  };

  /** The documentation tree, shown on every doc page. */
  const docsSidenav = (current) => ({
    label: 'Documentation',
    href: '/documentation/',
    title: 'Documentation',
    numbered: false,
    groups: docTypes.map((t) => ({
      title: t.title,
      items: t.items.map((d) => ({ href: d.href, title: title(d), current: d.href === current })),
    })),
  });

  /**
   * The training tree: every path with its modules, and the open module with
   * its units. A reader inside a unit can see the whole programme, not only
   * their five siblings.
   */
  const trainingSidenav = (currentHref, openModule) => ({
    label: 'Training',
    href: '/training/',
    title: 'Training',
    numbered: false,
    progress: false,
    groups: [
      ...paths.map((p) => ({
        title: title(p),
        items: [
          { href: p.href, title: 'Path overview', current: p.href === currentHref },
          ...modulesOf(p).map((m) => ({
            href: m.href,
            title: title(m),
            meta: minutes(duration(m)),
            current: m.href === currentHref,
          })),
        ],
      })),
      ...(openModule
        ? [
            {
              title: `${title(openModule)} - units`,
              items: unitsOf(openModule).map((u) => ({
                href: u.href,
                title: title(u),
                meta: minutes(u.data.durationInMinutes),
                current: u.href === currentHref,
              })),
            },
          ]
        : []),
      {
        title: 'Standalone modules',
        open: false,
        items: modules
          .filter((m) => !pathOf(m))
          .map((m) => ({ href: m.href, title: title(m), current: m.href === currentHref })),
      },
    ].filter((g) => g.items.length),
  });

  /** Cards for a mixed set of paths, modules, and docs. */
  const catalogueCards = (items) =>
    items.map((d) =>
      card({
        href: d.href,
        title: title(d),
        summary: summary(d),
        icon: iconOf(d),
        meta: [
          kindOf(d),
          d.kind === 'LearningPath' ? `${modulesOf(d).length} modules` : '',
          d.kind === 'Module' ? `${unitsOf(d).length} units` : '',
          d.kind === 'Module' ? minutes(duration(d)) : '',
        ],
      }),
    );

  // Search runs client side over this index; it is emitted, never hand-kept.
  const index = [];
  const indexEntry = (kind, doc, headings = []) =>
    index.push({ k: kind, t: title(doc), u: doc.href, s: summary(doc), h: headings.join(' ') });

  /**
   * The machine-readable projection of the same corpus.
   *
   * One model, many projections: the HTML a person reads and the JSON an agent
   * fetches are generated from one pass over one graph, so they cannot disagree.
   * Each entry keeps the authored markdown as `source` - that is what an agent
   * should read, not HTML it has to strip tags out of.
   */
  const api = [];
  const apiEntry = (node, { kind, source = '', headings = [], extra = {} }) => {
    const m = meta(node) ?? {};
    api.push({
      // The authored UID is the identity; deriving one from a filename would
      // invent a second name for the same node.
      uid: node.data?.uid ?? m.uid ?? `cogitave.learn.docs.${slugify(node.srcRel ?? node.href)}`,
      kind,
      href: node.href,
      title: title(node),
      summary: summary(node),
      type: m.type ?? null,
      products: axisValues(node, AXES[0]),
      roles: axisValues(node, AXES[1]),
      levels: axisValues(node, AXES[2]),
      subjects: axisValues(node, AXES[3]),
      headings,
      source,
      ...extra,
    });
  };

  return {
    byUid,
    achievements,
    ctxFor,
    paths,
    modules,
    units,
    docPages,
    withheld,
    title,
    summary,
    unitsOf,
    modulesOf,
    duration,
    pathOf,
    AXES,
    label,
    meta,
    axisValues,
    kindOf,
    iconOf,
    catalogue,
    facets,
    facetHref,
    facetsOf,
    docTypes,
    nav,
    docsSidenav,
    trainingSidenav,
    catalogueCards,
    index,
    indexEntry,
    api,
    apiEntry,
  };
}
