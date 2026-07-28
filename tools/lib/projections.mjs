import { join, dirname, relative, sep } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, copyFileSync } from 'node:fs';

import { dedent } from './includes.mjs';

/**
 * The machine- and asset-side emission: healthz, the copied assets, the search
 * index, the per-node `_api/*.json`, the corpus/code-samples/index aggregates,
 * and llms.txt / llms-full.txt. Same corpus, same build pass, many shapes.
 */
export function emitProjections(vm, { outDir, ROOT, HERE }) {
  const { index, api } = vm;

  // --- healthz: the synthetics probe in infra targets /docs/healthz ---
  mkdirSync(join(outDir, 'docs'), { recursive: true });
  writeFileSync(join(outDir, 'docs', 'healthz'), 'ok\n', 'utf8');

  // --- assets ---
  // style.css is assembled from the ordered partials in assets/css/ so no single
  // file carries the whole stylesheet; the concatenation is byte-exact and ships
  // as one served file (one request, no cascade surprises).
  mkdirSync(join(outDir, 'assets'), { recursive: true });
  const cssDir = join(HERE, 'assets', 'css');
  const cssParts = readdirSync(cssDir)
    .filter((f) => f.endsWith('.css'))
    .sort()
    .map((f) => readFileSync(join(cssDir, f)));
  writeFileSync(join(outDir, 'assets', 'style.css'), Buffer.concat(cssParts));
  for (const f of ['app.js', 'favicon.svg', 'og.png']) {
    copyFileSync(join(HERE, 'assets', f), join(outDir, 'assets', f));
  }

  // Vendored third-party assets, fetched only by the pages that need them.
  const vendorSrc = join(HERE, 'assets', 'vendor');
  if (existsSync(vendorSrc)) {
    const vendorOut = join(outDir, 'assets', 'vendor');
    mkdirSync(vendorOut, { recursive: true });
    for (const f of readdirSync(vendorSrc)) copyFileSync(join(vendorSrc, f), join(vendorOut, f));
  }

  // The faces ship with the licence text that must travel with them.
  const fontSrc = join(HERE, 'assets', 'fonts');
  const fontOut = join(outDir, 'assets', 'fonts');
  mkdirSync(fontOut, { recursive: true });
  for (const f of readdirSync(fontSrc)) {
    if (f.endsWith('.woff2') || f.startsWith('LICENSE')) {
      copyFileSync(join(fontSrc, f), join(fontOut, f));
    }
  }
  writeFileSync(join(outDir, 'search-index.json'), JSON.stringify(index), 'utf8');

  // --- machine-readable projections -------------------------------------------
  //
  // Same corpus, same build pass, three shapes:
  //   _api/       - one JSON per node plus a catalogue, for a program
  //   llms.txt    - a curated index, for a model deciding what to fetch
  //   llms-full.txt - the whole corpus inline, for a model with room to read it
  //
  // None of these is an MCP endpoint. MCP is a live JSON-RPC service over
  // Streamable HTTP and cannot be a static file; see docs/build-v0.md.

  const apiDir = join(outDir, '_api');
  mkdirSync(apiDir, { recursive: true });
  for (const node of api) writeFileSync(join(apiDir, `${node.uid}.json`), JSON.stringify(node, null, 2), 'utf8');

  /*
   * Two aggregates the /mcp Pages Function reads at cold start.
   *
   * The per-node files above are the addressable surface - fetch exactly the UID
   * you asked for. An edge runtime cannot use them to LOAD the corpus: that is
   * one subrequest per node, and platforms cap subrequests per invocation, so
   * the shape fails precisely under the traffic it should survive. One bundle is
   * one subrequest at any corpus size.
   *
   * `code-samples.json` exists because the snippet registry is excluded from the
   * published content set and therefore has no static path of its own. On Node
   * the server walks `snippets/`; at the edge there is no filesystem, so the
   * regions are projected here and both runtimes end up with the same shape.
   */
  writeFileSync(join(apiDir, 'corpus.json'), JSON.stringify(api), 'utf8');

  const extractRegions = (text, source, language = '') => {
    // The marker must own its line: a looser pattern extracts the registry's own
    // header comment - which explains the convention in prose - as a phantom
    // sample called "region".
    const re =
      /^[ \t]*(?:\/\/|#|--)[ \t]*<([A-Za-z0-9_-]+)>[ \t]*$([\s\S]*?)^[ \t]*(?:\/\/|#|--)[ \t]*<\/\1>[ \t]*$/gm;
    const out = [];
    let m;
    while ((m = re.exec(text)) !== null) out.push({ source, region: m[1], language, code: dedent(m[2]) });
    return out;
  };

  const snippetRoot = join(ROOT, 'snippets');
  const codeSamples = [];
  if (existsSync(snippetRoot)) {
    const walkSnippets = (dir) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walkSnippets(full);
        else {
          const rel = `snippets/${relative(snippetRoot, full).split(sep).join('/')}`;
          codeSamples.push(
            ...extractRegions(readFileSync(full, 'utf8'), rel, full.endsWith('.ts') ? 'typescript' : ''),
          );
        }
      }
    };
    walkSnippets(snippetRoot);
  }
  writeFileSync(join(apiDir, 'code-samples.json'), JSON.stringify(codeSamples, null, 2), 'utf8');
  writeFileSync(
    join(apiDir, 'index.json'),
    JSON.stringify(
      {
        site: 'learn.cogitave.com',
        generated: null, // deliberately absent: a timestamp would churn every build
        count: api.length,
        nodes: api.map(({ uid, kind, href, title: t, summary: s, type }) => ({
          uid,
          kind,
          href,
          title: t,
          summary: s,
          type,
          json: `/_api/${uid}.json`,
        })),
      },
      null,
      2,
    ),
    'utf8',
  );

  const SITE_URL = 'https://learn.cogitave.com';
  const group = (label, kinds) => {
    const rows = api.filter((n) => kinds.includes(n.kind));
    return rows.length
      ? `\n## ${label}\n\n` +
          rows
            .map((n) => `- [${n.title}](${SITE_URL}${n.href}): ${n.summary || 'No summary.'}`)
            .join('\n') +
          '\n'
      : '';
  };

  const llmsHeader =
    `# Cogitave Learn\n\n` +
    `> Documentation, guided learning paths, and hands-on modules for everything Cogitave\n` +
    `> builds. This file and the site are generated from one corpus, so what a model reads\n` +
    `> here is what a person reads there.\n\n` +
    `Every entry below is also available as JSON at ${SITE_URL}/_api/{uid}.json, and the\n` +
    `full catalogue at ${SITE_URL}/_api/index.json.\n`;

  writeFileSync(
    join(outDir, 'llms.txt'),
    llmsHeader +
      group('Documentation', ['doc']) +
      group('Learning paths', ['learningPath']) +
      group('Modules', ['module']) +
      group('Units', ['moduleUnit']),
    'utf8',
  );

  writeFileSync(
    join(outDir, 'llms-full.txt'),
    llmsHeader +
      api
        .map(
          (n) =>
            `\n\n---\n\n# ${n.title}\n\n` +
            `- uid: ${n.uid}\n- kind: ${n.kind}\n- url: ${SITE_URL}${n.href}\n` +
            (n.type ? `- type: ${n.type}\n` : '') +
            (n.products.length ? `- products: ${n.products.join(', ')}\n` : '') +
            `\n${n.summary}\n` +
            (n.source ? `\n${n.source.trim()}\n` : ''),
        )
        .join(''),
    'utf8',
  );

  // --- sitemap.xml + robots.txt: crawler discovery over every emitted page ---
  const pageUrls = [];
  const walkPages = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkPages(full);
      else if (entry === 'index.html') {
        const rel = relative(outDir, dirname(full)).split(sep).join('/');
        pageUrls.push(rel ? `/${rel}/` : '/');
      }
    }
  };
  walkPages(outDir);
  pageUrls.sort();
  writeFileSync(
    join(outDir, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      pageUrls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n') +
      '\n</urlset>\n',
    'utf8',
  );
  writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

  // --- _headers: security headers applied by Cloudflare Pages to every path.
  // Inline theme resolver + mermaid's injected SVG styles need 'unsafe-inline';
  // everything else is same-origin only, framing and object embeds are denied. ---
  writeFileSync(
    join(outDir, '_headers'),
    '/*\n' +
      "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'\n" +
      '  X-Content-Type-Options: nosniff\n' +
      '  Referrer-Policy: strict-origin-when-cross-origin\n' +
      '  Permissions-Policy: geolocation=(), microphone=(), camera=()\n' +
      '  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload\n' +
      // Fonts are content-stable (fixed names, bytes never change) - cache hard.
      // The hashless CSS/JS change on deploy, so revalidate rather than pin.
      '/assets/fonts/*\n' +
      '  Cache-Control: public, max-age=31536000, immutable\n' +
      '/assets/*\n' +
      '  Cache-Control: public, max-age=3600, must-revalidate\n',
    'utf8',
  );
}
