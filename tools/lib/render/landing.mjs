import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { escapeHtml } from '../markdown.mjs';
import { icon } from '../icons.mjs';
import {
  shell, card, cardGrid, indexRank, indexTable, linkCard, linkCards, heroSearch, minutes,
} from '../layout.mjs';
import { writePage } from './site.mjs';

/**
 * The reader-facing landings: home '/', /training/, /documentation/, /browse/,
 * every facet page, and the "connect an agent" card. This runs before the node
 * page renderers so the facet pages seed the search index in the right order.
 */
export function renderLanding(vm, outDir) {
  const {
    paths, modules, summary, title, modulesOf, unitsOf, duration, facets, AXES,
    facetsOf, docPages, iconOf, docTypes, catalogue, catalogueCards, label,
    facetHref, indexEntry, nav,
  } = vm;

  // --- home ----------------------------------------------------------------
  const section = (id, heading, iconName, count, cards) =>
    cards.length
      ? `<section id="${id}"><div class="section-head"><h2>${icon(iconName, { size: 20 })} ${escapeHtml(heading)}</h2>` +
        `<span class="section-count">${String(count).padStart(2, '0')}</span></div>${cardGrid(cards)}</section>`
      : '';

  const pathCards = paths.map((p) =>
    card({
      href: p.href,
      title: title(p),
      summary: summary(p),
      icon: 'path',
      meta: [`${modulesOf(p).length} modules`, minutes(modulesOf(p).reduce((n, m) => n + duration(m), 0))],
    }),
  );
  const moduleCards = modules.map((m) =>
    card({
      href: m.href,
      title: title(m),
      summary: summary(m),
      icon: 'module',
      meta: [`${unitsOf(m).length} units`, minutes(duration(m))],
    }),
  );

  const browseSection = (more) =>
    facets.size
      ? `<section id="browse"><div class="section-head"><h2>${icon('path', { size: 20 })} Browse</h2>` +
        (more ? `<a class="section-more" href="/browse/">All ways in ${icon('arrowRight')}</a>` : '') +
        `</div>` +
        indexTable(AXES.map((axis) => indexRank(axis.plural, facetsOf(axis.key)))) +
        `</section>`
      : '';

  // The home page states what each region is FOR and hands over. It does not
  // reprint the catalogue: /training/ and /documentation/ own those lists, and
  // a home page that repeats them teaches a reader nothing about the shape.
  // A "connect an agent" card for the right of the hero: the exact commands to
  // wire the live MCP server or add the Claude Code plugin, each copyable. These
  // are runnable as-is, so the card teaches by being pasteable, not by linking off.
  const cmd = (text) =>
    `<div class="code hc-cmd">` +
    `<button class="code-copy" type="button" aria-label="Copy code">` +
    `${icon('copy', { class: 'i-copy' })}${icon('check', { class: 'i-check' })}</button>` +
    `<pre><code>${escapeHtml(text)}</code></pre></div>`;
  // The MCP server is client-agnostic: one public endpoint, added a different way
  // per agent. A radio/:checked switcher (no JS) flips between the exact, verified
  // connect snippet for each client; every snippet is separately copyable. We do
  // not ship only a Claude Code path, because the same server works from any of
  // these agents. Snippets checked against each vendor's current docs (2026).
  const MCP_URL = 'https://learn.cogitave.com/mcp';
  const clients = [
    {
      id: 'cc',
      name: 'Claude Code',
      icon: 'terminal',
      body:
        `<span class="hcl">CLI</span>` +
        cmd(`claude mcp add --transport http cogitave-learn ${MCP_URL}`) +
        `<span class="hcl">or plugin</span>` +
        cmd('/plugin marketplace add cogitave-ai/plugins') +
        cmd('/plugin install cogitave-learn@cogitave'),
    },
    {
      id: 'codex',
      name: 'Codex',
      icon: 'braces',
      body:
        `<span class="hcl">~/.codex/config.toml</span>` +
        cmd(`[mcp_servers.cogitave-learn]\nurl = "${MCP_URL}"`),
    },
    {
      id: 'cursor',
      name: 'Cursor',
      icon: 'braces',
      body:
        `<span class="hcl">~/.cursor/mcp.json</span>` +
        cmd(`{\n  "mcpServers": {\n    "cogitave-learn": {\n      "url": "${MCP_URL}"\n    }\n  }\n}`),
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      icon: 'braces',
      body:
        `<span class="hcl">~/.codeium/windsurf/mcp_config.json</span>` +
        cmd(`{\n  "mcpServers": {\n    "cogitave-learn": {\n      "serverUrl": "${MCP_URL}"\n    }\n  }\n}`),
    },
    {
      id: 'vscode',
      name: 'VS Code',
      icon: 'braces',
      body:
        `<span class="hcl">.vscode/mcp.json</span>` +
        cmd(`{\n  "servers": {\n    "cogitave-learn": {\n      "type": "http",\n      "url": "${MCP_URL}"\n    }\n  }\n}`),
    },
    {
      id: 'cline',
      name: 'Cline',
      icon: 'braces',
      body:
        `<span class="hcl">cline_mcp_settings.json</span>` +
        cmd(`{\n  "mcpServers": {\n    "cogitave-learn": {\n      "type": "streamableHttp",\n      "url": "${MCP_URL}",\n      "disabled": false\n    }\n  }\n}`),
    },
    {
      id: 'zed',
      name: 'Zed',
      icon: 'braces',
      body:
        `<span class="hcl">settings.json &middot; context_servers</span>` +
        cmd(`{\n  "context_servers": {\n    "cogitave-learn": {\n      "url": "${MCP_URL}"\n    }\n  }\n}`),
    },
  ];
  const heroConnect =
    `<aside class="hero-connect"><div class="hero-connect-inner">` +
    `<p class="hero-connect-kicker">Built for agents too</p>` +
    `<h2>Connect an agent</h2>` +
    `<p>The same corpus a person reads &mdash; exposed over MCP for your agent to query.</p>` +
    `<div class="hc-switch">` +
    clients
      .map(
        (c, i) =>
          `<input class="hc-radio" type="radio" name="hcclient" id="hc-${c.id}"${i === 0 ? ' checked' : ''}>`,
      )
      .join('') +
    `<div class="hc-tabs" role="radiogroup" aria-label="Choose your agent to add the MCP server">` +
    clients
      .map((c) => `<label class="hc-tab" for="hc-${c.id}">${icon(c.icon)}<span>${c.name}</span></label>`)
      .join('') +
    `</div>` +
    `<div class="hc-panels">` +
    clients.map((c) => `<div class="hc-panel p-${c.id}">${c.body}</div>`).join('') +
    `</div>` +
    // The endpoint accepts the current 2025-11-25 handshake that shipping clients
    // speak AND the newer stateless 2026-07-28, so the honest note is simply that
    // it works with today's clients and is ready for the new revision.
    `<p class="hero-connect-note">Speaks the current ` +
    `<a href="https://modelcontextprotocol.io/specification/2025-11-25">2025-11-25</a> revision and the ` +
    `newer stateless <a href="https://modelcontextprotocol.io/specification/2026-07-28">2026-07-28</a>, ` +
    `so it works with today's clients.</p>` +
    `</div></aside>`;

  const home =
    `<div class="hero hero-lead hero-split">` +
    `<div class="hero-main">` +
    `<h1>Learn Cogitave</h1>` +
    `<p class="lede">Documentation, guided learning, and hands-on practice for everything ` +
    `Cogitave builds &mdash; products, platform services, and the standards they are built to. ` +
    `One corpus: the same source a person reads and an agent queries.</p>` +
    heroSearch() +
    `</div>` +
    heroConnect +
    `</div>` +
    `<section id="start"><div class="section-head"><h2>${icon('path', { size: 20 })} Start here</h2></div>` +
    linkCards(
      [
        docPages.length
          ? linkCard({
              title: 'Read the documentation',
              description:
                'Reference, how-to guides, and the explanations behind them - what the platform does and how it is meant to be used.',
              items: docPages.slice(0, 3).map((d) => ({ href: d.href, label: title(d), icon: 'doc' })),
              moreHref: '/documentation/',
              moreLabel: 'All documentation',
            })
          : '',
        paths.length || modules.length
          ? linkCard({
              title: 'Take the training',
              description:
                'Guided paths and hands-on modules with exercises and knowledge checks. Start anywhere; each unit stands on its own.',
              items: [...paths, ...modules]
                .slice(0, 3)
                .map((d) => ({ href: d.href, label: title(d), icon: iconOf(d) })),
              moreHref: '/training/',
              moreLabel: 'All training',
            })
          : '',
        facetsOf('product').length
          ? linkCard({
              title: 'Find by what you work on',
              description:
                'Every page is tagged by product, role, level, and subject, so you can enter from the axis that matches your work.',
              items: facetsOf('product')
                .slice(0, 3)
                .map((f) => ({ href: f.href, label: f.label, icon: 'module' })),
              moreHref: '/browse/',
              moreLabel: 'Browse everything',
            })
          : '',
      ].filter(Boolean),
    ) +
    `</section>` +
    browseSection(true);

  writePage(
    outDir,
    '/',
    shell({
      title: 'Learn',
      description:
        'Documentation, guided learning, and hands-on practice for everything Cogitave builds - products, platform services, and the standards they are built to.',
      body: home,
      nav,
      layout: 'wide',
      hideHeaderSearch: true,
    }),
  );

  // --- 404: served by Cloudflare Pages for any path with no static asset, so a
  // stale or mistyped URL - including a missing /_api/{uid}.json an agent asked
  // for - lands on a real not-found page with a 404 status (paired with the
  // /* -> /404.html 404 rule in _redirects), not a 200 masquerading as the home
  // page. Written to the site root as 404.html, which is the name Pages looks
  // for, rather than through writePage (which would nest it at /404/index.html).
  writeFileSync(
    join(outDir, '404.html'),
    shell({
      title: 'Page not found',
      description: 'That page is not here. Search the corpus or start from a section.',
      body:
        `<div class="hero"><h1>Page not found</h1>` +
        `<p class="lede">That page is not here - it may have moved, or the link may be wrong. ` +
        `Search the corpus, or head back to a main section.</p>` +
        heroSearch() +
        `<p class="nf-links">` +
        `<a href="/">Home</a> &middot; <a href="/documentation/">Documentation</a> &middot; ` +
        `<a href="/training/">Training</a> &middot; <a href="/browse/">Browse</a></p>` +
        `</div>`,
      nav,
      layout: 'wide',
      hideHeaderSearch: true,
    }),
    'utf8',
  );

  // --- section landings -------------------------------------------------------
  writePage(
    outDir,
    '/training/',
    shell({
      title: 'Training',
      description:
        'Every Cogitave learning path and module: guided programmes and hands-on units with exercises and knowledge checks.',
      body:
        `<div class="hero"><h1>Training</h1>` +
        `<p class="lede">Guided paths group modules into a programme; a module is a set of short ` +
        `units with an exercise and a knowledge check. Every module also stands on its own.</p></div>` +
        section('paths', 'Learning paths', 'path', paths.length, pathCards) +
        section('modules', 'Modules', 'module', modules.length, moduleCards),
      nav,
      section: 'training',
      layout: 'wide',
    }),
  );

  // No landing for a region with nothing in it: an empty page is worse than a
  // missing one, and the masthead already drops the link.
  if (docPages.length) writePage(
    outDir,
    '/documentation/',
    shell({
      title: 'Documentation',
      description:
        'Reference, how-to guides, tutorials, and explanations for the Cogitave platform, grouped by what each page is for.',
      body:
        `<div class="hero"><h1>Documentation</h1>` +
        `<p class="lede">Grouped by what a page is for, not by what it is about: guides that get ` +
        `you through a task, reference you look things up in, explanation you read once.</p></div>` +
        docTypes
          .map((t) =>
            section(
              t.key,
              t.title,
              'doc',
              t.items.length,
              t.items.map((d) =>
                card({ href: d.href, title: title(d), summary: summary(d), icon: 'doc', meta: [d.meta.type ?? ''] }),
              ),
            ),
          )
          .join(''),
      nav,
      section: 'docs',
      layout: 'wide',
    }),
  );

  // --- browse -----------------------------------------------------------------
  const browseBody =
    `<div class="hero">` +
    `<h1>Browse</h1>` +
    `<p class="lede">Every learning path, module, and documentation page in the estate, ` +
    `entered by the axis that suits you: what it covers, who it is for, how deep it goes.</p>` +
    `</div>` +
    AXES.map((axis) => {
      const values = facetsOf(axis.key);
      return values.length
        ? `<section id="${axis.key}"><div class="section-head">` +
          `<h2>${icon(axis.icon, { size: 20 })} ${escapeHtml(axis.plural)}</h2>` +
          `<span class="section-count">${String(values.length).padStart(2, '0')}</span></div>` +
          indexTable([indexRank(axis.plural, values)]) +
          `</section>`
        : '';
    }).join('') +
    `<section id="everything"><div class="section-head">` +
    `<h2>${icon('doc', { size: 20 })} Everything</h2>` +
    `<span class="section-count">${String(catalogue.length).padStart(2, '0')}</span></div>` +
    cardGrid(catalogueCards(catalogue)) +
    `</section>`;

  writePage(
    outDir,
    '/browse/',
    shell({
      title: 'Browse',
      description:
        'Browse the Cogitave knowledge platform by product, role, level, or subject, or see the full catalogue of learning paths, modules, and documentation.',
      body: browseBody,
      nav,
      section: 'browse',
      layout: 'wide',
    }),
  );

  for (const facet of facets.values()) {
    const name = label(facet.value);
    const href = facetHref(facet.axis.key, facet.value);
    const siblings = facetsOf(facet.axis.key);
    const body =
      `<article class="browse">` +
      `<h1>${escapeHtml(name)}</h1>` +
      `<p class="lede">${facet.items.length} ` +
      `${facet.items.length === 1 ? 'entry' : 'entries'} tagged ` +
      `${escapeHtml(facet.axis.label.toLowerCase())} <strong>${escapeHtml(name)}</strong>.</p>` +
      cardGrid(catalogueCards(facet.items)) +
      indexTable([indexRank('Other ' + facet.axis.plural.toLowerCase(), siblings.filter((s) => s.href !== href))]) +
      `</article>`;

    indexEntry(`Browse - ${facet.axis.label}`, {
      kind: 'doc',
      href,
      meta: { title: name, description: `${facet.axis.label}: ${name}` },
    });
    writePage(
      outDir,
      href,
      shell({
        title: `${name} - ${facet.axis.label}`,
        description: `Learning paths, modules, and documentation tagged ${facet.axis.label.toLowerCase()} ${name} in the Cogitave knowledge platform.`,
        body,
        nav,
        section: 'browse',
        breadcrumb: [
          { label: 'Learn', href: '/' },
          { label: 'Browse', href: '/browse/' },
          { label: name },
        ],
        layout: 'wide',
      }),
    );
  }
}
