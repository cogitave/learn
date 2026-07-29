/**
 * Post-emit validation: rules that can only be checked once the WHOLE site is
 * assembled, working on the emitted HTML rather than the source. Running on the
 * real output is what makes these robust and tab-aware - an anchor into a
 * heading inside a tab panel resolves because that panel's id is in the markup.
 *
 * checkEmittedBookmarks is the two-pass complement to the same-page anchor check
 * in render/pages.mjs: same-page `#anchor` links are validated at render time
 * against the page's own body; a cross-page `/other/page/#section` link can only
 * be validated after `/other/page/` has been emitted too. Together they are the
 * `broken-bookmark` gate (build.mjs, docs/build-v0.md).
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Every `.html` file under `dir`, recursively. */
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

/**
 * The site-absolute URL an emitted file serves at:
 *   index.html            -> /
 *   modules/x/y/index.html -> /modules/x/y/
 *   foo.html              -> /foo.html
 * This is the same key form the renderers use for hrefs, so a link's path and
 * the page it points at compare directly.
 */
function urlOf(outDir, file) {
  const rel = relative(outDir, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'index.html'.length);
  return '/' + rel;
}

/** Normalize a link's path to the page-URL key form pages are indexed under. */
function keyOf(path) {
  if (path.endsWith('/index.html')) return path.slice(0, -'index.html'.length);
  if (path === 'index.html') return '/';
  return path;
}

/**
 * Cross-page broken-bookmark gate. An anchor link that points at another
 * emitted page (`/training/#paths`) must resolve to an `id` on that page.
 *
 * Same-page anchors (`href="#x"`, empty path) are already checked at render
 * time and are skipped here - the `[^"#]+` path segment requires at least one
 * character before the `#`. A link whose path is NOT an emitted page is a
 * link-integrity concern owned by a different rule (resolveLink neutralizes
 * out-of-corpus links to plain text, so they never reach here with an href), so
 * it is skipped rather than double-reported as a bookmark failure.
 */
export function checkEmittedBookmarks(outDir, err) {
  const files = htmlFiles(outDir);
  const ids = new Map(); // page URL -> Set<id>
  const links = []; // { from, path, frag }

  for (const file of files) {
    const url = urlOf(outDir, file);
    const html = readFileSync(file, 'utf8');
    const set = new Set();
    for (const m of html.matchAll(/\bid="([^"]+)"/g)) set.add(m[1]);
    ids.set(url, set);
    for (const m of html.matchAll(/href="([^"#]+)#([^"]+)"/g)) {
      const path = m[1];
      if (/^(?:https?:|mailto:|tel:|\/\/)/i.test(path)) continue; // external
      links.push({ from: url, path, frag: m[2] });
    }
  }

  for (const { from, path, frag } of links) {
    const set = ids.get(keyOf(path));
    if (!set) continue; // target is not an emitted page: not a bookmark concern
    if (!set.has(frag)) {
      err('broken-bookmark', from, `cross-page link ${path}#${frag} has no matching id on that page`);
    }
  }
}
