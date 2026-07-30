#!/usr/bin/env node
/**
 * learn.cogitave.com - v0 build.
 *
 * ACQUIRE -> PARSE -> LINK -> VALIDATE -> EMIT
 *
 * This is the honest v0 of the pipeline specified in docs/engine-architecture.md.
 * It implements the stages end to end but a deliberate SUBSET of the contract in
 * docs.config.json. What is and is not implemented is recorded in
 * docs/build-v0.md; read that before assuming a rule is enforced.
 *
 * Implemented blocking rules (8 of 11):
 *   schema, metadata-required, unit-membership, achievement-resolves,
 *   broken-link, broken-xref, broken-bookmark (same-page AND cross-page anchors)
 * Plus an engine safety net beyond the docs.config contract:
 *   render-fidelity - a literal '**' surviving into rendered prose means the
 *   emphasis parser could not pair a bold span (validate-emitted.mjs).
 * Deferred (reported as warnings or not at all):
 *   code-snippet-resolves (compile check), quiz-shape (partially checked),
 *   alt-text, stale-content
 *
 * Zero runtime dependencies, per ADR-0003 (build from scratch).
 *
 * Usage:  node tools/build.mjs [--out _site] [--quiet]
 */

import { readFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createReporter } from './lib/reporter.mjs';
import { acquire } from './lib/acquire.mjs';
import { parseAll } from './lib/parse.mjs';
import { link } from './lib/link.mjs';
import { validate } from './lib/validate.mjs';
import { setAssets } from './lib/layout.mjs';
import { buildViewModel } from './lib/render/site.mjs';
import { renderLanding } from './lib/render/landing.mjs';
import { renderPages } from './lib/render/pages.mjs';
import { emitProjections, hashAssets } from './lib/projections.mjs';
import { checkEmittedBookmarks, checkRenderFidelity } from './lib/validate-emitted.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..'); // the learn content root

const reporter = createReporter();
const { errors, warnings, err, warn } = reporter;

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const outArg = args.indexOf('--out');
  const outDir = join(ROOT, outArg === -1 ? '_site' : args[outArg + 1]);
  const quiet = args.includes('--quiet');

  const config = JSON.parse(readFileSync(join(ROOT, 'docs.config.json'), 'utf8'));

  const sources = acquire(config, { ROOT, err });
  const docs = parseAll(sources, { ROOT, err });
  const graph = link(docs, { err });
  validate(docs, graph, { err });

  if (errors.length) {
    report(quiet);
    console.error(`\nBuild FAILED: ${errors.length} blocking error(s). No output written.`);
    process.exit(1);
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  // Hash the changing assets first: the shell must reference the hashed names
  // as it renders, and emitProjections writes the same bytes under them.
  const assets = hashAssets(HERE);
  setAssets({ css: `/assets/${assets.css.name}`, js: `/assets/${assets.js.name}` });
  const vm = buildViewModel({ docs, byUid: graph.byUid, achievements: graph.achievements, ROOT, reporter });
  renderLanding(vm, outDir);
  renderPages(vm, outDir, { ROOT, err });
  emitProjections(vm, { outDir, ROOT, HERE, assets });
  // Post-emit checks on the assembled site: cross-page bookmarks resolve only
  // once every target page exists, and render-fidelity reads the final HTML to
  // catch emphasis markers the parser failed to pair.
  checkEmittedBookmarks(outDir, err);
  checkRenderFidelity(outDir, err);
  const counts = {
    paths: vm.paths.length,
    modules: vm.modules.length,
    units: vm.units.length,
    docs: vm.docPages.length,
    withheld: vm.withheld,
  };

  // Emission can surface late errors (unresolvable includes/snippets).
  if (errors.length) {
    report(quiet);
    console.error(`\nBuild FAILED during emit: ${errors.length} blocking error(s).`);
    process.exit(1);
  }

  report(quiet);
  if (!quiet) {
    console.log(
      `\nBuild OK  ->  ${relative(ROOT, outDir) || '_site'}\n` +
        `  ${counts.paths} learning path(s), ${counts.modules} module(s), ` +
        `${counts.units} unit(s), ${counts.docs} doc page(s)` +
        (counts.withheld ? `\n  ${counts.withheld} page(s) held back (visibility: internal)` : ''),
    );
  }
}

function report(quiet) {
  for (const w of warnings) console.warn(`warn  [${w.rule}] ${w.file}: ${w.msg}`);
  for (const e of errors) console.error(`ERROR [${e.rule}] ${e.file}: ${e.msg}`);
  if (!quiet && !warnings.length && !errors.length) console.log('All implemented gates passed.');
}

main();
