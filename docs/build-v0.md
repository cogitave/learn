---
uid: cogitave.learn.docs.build-v0
title: Build v0 - what is implemented, and every deviation from the contract
description: The honest scope of the v0 build for learn.cogitave.com - which of the eleven blocking validation rules are enforced, which output targets are emitted, and each recorded deviation from docs.config.json, the engine architecture, and the design system.
type: reference
owner: cogitave/platform
lastReviewed: 2026-07-25
products:
  - cogitave-core
roles:
  - developer
  - platform-engineer
level: intermediate
visibility: internal   # engineering document: stays in git, not published
status: draft
---

# Build v0 - what is implemented, and every deviation

> [`docs.config.json`](../docs.config.json) and
> [`engine-architecture.md`](engine-architecture.md) describe the **target**.
> This document describes what the build in [`../tools/`](../tools/) actually
> does today. Where the two differ, this document is the accurate one.
>
> The gap is deliberate: v0 exists to put real, correct bytes on the site, not
> to be the engine. Every shortcut is listed here rather than left to be
> discovered.

## How to run it

```bash
cd cogitave/learn
node tools/build.mjs          # emits _site/
node tools/build.mjs --quiet  # same, diagnostics only
```

Zero runtime dependencies (ADR-0003). Requires Node >= 22. The build exits
non-zero on any blocking error and writes no output in that case.

## What it does

`ACQUIRE -> PARSE -> LINK -> VALIDATE -> EMIT`, as specified - but with a
subset of each stage.

| Stage | v0 behavior |
|---|---|
| ACQUIRE | Walks the three content roots in `docs.config.json`, honoring `files` and `exclude` globs (`**`, `*`, `?`). |
| PARSE | `tools/lib/yaml.mjs` - a YAML subset parser covering exactly the constructs the corpus uses. `tools/lib/markdown.mjs` - a CommonMark subset plus the Learn extension set. |
| LINK | Builds a UID index, resolves `Module.units[]`, `LearningPath.modules[]`, badge/trophy, and assigns URLs. |
| VALIDATE | 7 of 11 blocking rules (below). |
| EMIT | HTML only, to `_site/`. |

Extensions rendered: alerts, `[!include]`, fenced code, `:::code` snippet
by reference (with `id` region and `range` selection), `::: moniker range`,
`# [Label](#tab/id)` tab groups, `@uid` xrefs, lists, blockquotes, headings,
pipe tables.

The emitted chrome - masthead, section navigation, on-page rail, cards, pager,
taxonomy chips, colophon, footer - is defined once in `tools/lib/layout.mjs` and
specified in [design-language](design-language.md). A page kind cannot invent its
own shell.

Every content page (path, module, unit, doc) carries a **page-actions toolbar**
above the title, where a reader looks for a page's machine shapes: a **"Copy
page"** control that fetches the markdown and writes it to the clipboard for
handing to an agent (script-only, so hidden without JavaScript), and a **"View
as"** dropdown - a native `<details>`, so it works either way - linking the same
node's raw markdown (`/_api/<uid>.md`) and structured JSON (`/_api/<uid>.json`).
The raw-markdown projection is emitted only for the full-prose pages (units and
docs); a structural node (path, module) has no prose body, so it shows a single
"View as JSON" link and no "Copy page". Section headings (`h2`/`h3`) carry a
**hover-revealed anchor** to that section. Each page closes with a minimal
**colophon**: a "Report an issue" link and an "Updated" stamp from `lastReviewed`
/ `ms.date`. Path and module overviews also carry **taxonomy chips**: each
product, role, and subject tag links to its `/browse/<axis>/<value>/` facet, and
only tags that have a facet page are shown, so a chip never lands on a 404.

## Validation rules: 7 of 11 enforced

| Rule | v0 |
|---|---|
| `schema` | **enforced** - YamlMime type recognized, required fields per type |
| `metadata-required` | **enforced** - description present and 75-300 chars |
| `unit-membership` | **enforced** - every `units[]`/`modules[]` UID resolves to the right type |
| `achievement-resolves` | **enforced** - every badge/trophy exists in `achievements.yml` |
| `broken-link` | **enforced** - includes and `:::code` sources resolve on disk |
| `quiz-shape` | **partial** - choice count, exactly-one-correct, explanation present |
| `broken-xref` | **enforced** - an unresolvable `@uid` fails the build instead of rendering as literal text |
| `broken-bookmark` | **enforced (same-page)** - every `#anchor` in a rendered body resolves to an `id` in that body; checked on the emitted HTML, so it is tab-aware. Cross-page `/other/#x` targets are a two-pass check and stay deferred. |
| `code-snippet-resolves` | **partial** - the region is resolved, but **not compile-checked** |
| `alt-text` | deferred - `:::image` is not implemented at all |
| `stale-content` | deferred - `lastReviewed` is not evaluated; see [content-lifecycle](content-lifecycle.md) for the intended window |

## Output targets: 3 of 5 emitted

| Target | v0 |
|---|---|
| HTML (`_site/`) | **emitted** - home, the three region landings (`/documentation/`, `/training/`, `/browse/`), a generated page per taxonomy value (`/browse/<axis>/<value>/`), plus every path, module, unit, and doc |
| JSON content API (`_api/`) | **emitted** - one JSON per node keyed by its authored UID, plus `_api/index.json` as the catalog. Carries the authored markdown as `source`, the heading rank, the taxonomy, graph edges (`partOf`, `units`, `modules`), and quizzes as structured data rather than rendered buttons. Each full-prose node (unit, doc) also gets `_api/<uid>.md` - the raw authored markdown, served as `text/plain`, behind the "View as Markdown" / "Copy page" affordances. |
| MCP (`cogitave-docs://`) | **served, not emitted.** MCP is a live JSON-RPC service, so it cannot be a static file. `tools/mcp/server.mjs` implements the **stateless** spec `2026-07-28` over stdio and Streamable HTTP - no `initialize` handshake, `server/discover` as the entry point, the protocol version per-request in `_meta`, a `resultType` on every result - reading the `_api/` projection so it cannot drift from the site. The older 2025-11-25 handshake is not supported. Tools: `docs_search`, `docs_fetch`, `code_sample_search`, `list_catalogue`, `get_related`, `resolve_xref`, `get_learning_path`; resources at `cogitave-docs://learn/{uid}`. `get_related` shares its scorer with the on-page "Related" section, and `get_learning_path` returns the ordered path(s) to a competency. Retrieval is **lexical, not hybrid** - there is no embedding store. Deploying it behind `learn.cogitave.com/mcp` is a human, gated step. See [`tools/mcp/README.md`](../tools/mcp/README.md) for the full delta against the Core contract. |
| `llms.txt` / `llms-full.txt` | **emitted** - `llms.txt` is the curated index (title, URL, summary per node, grouped by kind, in reading order); `llms-full.txt` inlines the whole corpus with front-matter facts. |
| Static search (`_pagefind/`) | **not** emitted - but `_site/search-index.json` is, and `assets/app.js` searches it client side over titles, summaries, and headings. This is a working search, not the specified one: no stemming, no fragment ranking, no pre-built index shards. |

`_site/docs/healthz` **is** emitted as a static file, because
`infra` synthetics probe that path and nothing in `docs.config.json` produces
it.

## Recorded deviations

**D1 - The build is not namzu; the serve is not yuva.**
`docs.config.json` declares `engine.build = namzu (typescript)` and
`engine.serve = yuva (rust)`. Neither contains a docs pipeline today - the
declaration is an intent, not a dependency. v0 is a local Node script emitting
static files. When namzu grows the build phase, this script is the executable
specification to port.

**D2 - Snippet sources resolve from the config directory, not the content root.**
`build.snippets.resolveSourceFrom` is `"contentRoot"`. Taken literally, the
learn-pr loader's root is `cogitave`, so `source="snippets/greeter/agent.ts"`
would resolve to `cogitave/snippets/...`, which does not exist - the registry is
at `<learn>/snippets/`. Under a literal reading the corpus's only `:::code`
reference fails a blocking gate. v0 resolves from the config directory. Either
`docs.config.json` should say `"configDir"`, or the authoring guide should state
the rule explicitly; until then this deviation keeps the build honest.

**D3 - Plain CSS, no design system package.**
`design-system.md` binds documentation surfaces to semantic tokens and the
golden component set. `cogitave/ui` and `cogitave/primitives` are README-only,
so there is nothing to consume. The surface therefore carries its own
specification - [design-language](design-language.md) - and
`tools/assets/style.css` uses custom properties named after the semantic roles
they will map onto when the package ships. No accessibility gate runs yet, which
`accessibility.md` calls non-waivable - that is a real, open gap; the design
language records the manual checks that stand in for it. The muted `--t3` palette
value, which used to fail AA for text, has since been raised to meet AA in both
themes.

**D4 - Moniker blocks render unconditionally.**
A `::: moniker range=">=yuva-2.0"` block is rendered with a visible "Applies to"
label rather than being resolved against the moniker registry and emitted once
per applicable version. Correct for a single default moniker; wrong as soon as
two versions of a page must differ.

**D5 - Five learning paths are excluded from the build.**
`contributor-onboarding`, `cogitave-engineering-standards`,
`build-on-cogitave-core`, `operate-the-estate` and `patterns-and-golden-paths`
reference 23 module UIDs and 5 trophies that do not exist. They are excluded in
`build.content[learn-pr].exclude`. Only `agent-platform-fundamentals` resolves
end to end. See the README for the list and the removal condition.

**D7 - Two display transforms are applied to authored metadata.**
Neither renames anything in the corpus; both are recorded because a reader
comparing the site to the source will notice them. (1) A **trailing**
`- learn.cogitave.com` is stripped from doc titles for display, since on the
site that context is the site. (2) Values in the build's internal-product list
(today `cogitave-core`) are tagged on content for traceability but never become
a public taxonomy facet - the pages stay reachable, the value is simply not a
way in. See [design-language](design-language.md) section 6.

**D8 - Publication is gated on `visibility`, and every engineering doc is held back.**
A page whose front matter carries `visibility: internal` stays in git and is not
emitted. Anything without the field publishes, so withholding is an explicit act
visible in review. All six platform-engineering documents - this one, the
authoring guide, the curriculum, the content lifecycle, the engine architecture,
and the design language - are marked internal: a knowledge platform publishes
what a reader needs, not how the platform is built. The build reports the count
it held back on every run.

**D9 - RESOLVED: the training corpus now teaches the real `@namzu/sdk` surface.**
An earlier corpus instructed the reader to write `new Agent({ ... })` with
`agent.tool({ ... })` and to run the result with
`yuva run ./dist/greeter.js --profile least-privilege`. None of it exists. The
corpus (and the `docs/` set) have been rewritten against the published surface,
pulled by reference from the snippet registry (`snippets/greeter/agent.ts`):

- `@namzu/sdk`'s real surface is `ProviderRegistry.create()` plus
  `provider.chatStream()` (aggregated to the legacy `ChatCompletionResponse`
  shape via `collect(provider.chatStream())`), tool definition via
  `defineTool()`, and execution via `ToolRegistry`; vendors register from
  separate driver packages (`@namzu/ollama`, ...).
- `cogitave/yuva` publishes no agent-run CLI, and its README states live
  inference is MOCK and learning is DORMANT - it cannot host an agent today. The
  corpus no longer claims otherwise; the Yuva slot is taught by the honest
  `understand-yuva` module, which states the boundary plainly.

Every symbol in the corpus is verified against `cogitave/namzu/packages/sdk/src`.
Compile-checking of snippet regions is not yet wired into the build (see the
snippet-resolver note above); the symbols are hand-verified, not `tsc`-checked.

**D6 - The close fence for moniker blocks is bare `:::`.**
The corpus uses `:::`; [`authoring-guide.md`](authoring-guide.md) documents
`:::moniker-end`. v0 accepts both, but the guide and the content should be
reconciled so the grammar has one answer.

## Known gaps that are not deviations

These are unresolved questions rather than shortcuts:

- **No CI.** Naming a workflow file `cogitave/learn/.github/workflows/*.yml`
  trips `estate-lint.py`, whose `check_learnpr` matches any `.yml` with `learn`
  in its path and demands a `### YamlMime:` first line. Use a `.yaml` extension,
  or scope that check to the declared content roots.
- **No deploy.** There is no publish path in the estate - no wrangler, no
  `pages deploy`, no S3 sync anywhere. v0 emits `_site/`; publishing is a human
  step.
- **`docs.config.schema.json` does not exist**, so `docs.config.json` validates
  against nothing.
- **No `xrefmap.yml` emitter**, though `build.xref.maps` points at one.
- **No achievement artwork.** The `iconUrl` values across `achievements.yml` and
  the path/module `index.yml` files reference `/learn/achievements/*.svg`; no
  such files exist yet, and the renderer does not consume `iconUrl` at all
  (`awardNote` in `tools/lib/layout.mjs`), so nothing 404s. Badges and trophies
  render as a typographic award block with an icon from the built-in set. The
  fields are retained as standard learn-pr metadata for when artwork lands.
- **No syntax highlighting.** Code frames carry a language label, the source
  path when pulled by reference, and a copy control, but the code itself is
  monochrome. Adding a grammar set is a supply-chain decision.
- **No completion state.** The progress indicator on a unit page reports
  position within the module, not what the reader has finished. There is no
  account and nothing is persisted except the theme choice.

## Module layout

`tools/build.mjs` is a thin orchestrator (~100 lines): it creates one diagnostics
reporter and runs the pipeline, threading `ROOT`, the reporter, and the config
explicitly rather than through module-level globals. Each stage and each emit
concern lives in its own module under `tools/lib/`, so no single file carries the
whole engine:

| Module | Responsibility |
|---|---|
| `lib/reporter.mjs` | the diagnostics sink - `err`/`warn` over the errors/warnings arrays |
| `lib/acquire.mjs` | ACQUIRE - walk the content roots into a source list |
| `lib/parse.mjs` | PARSE - front-matter split + YamlMime parse |
| `lib/link.mjs` | LINK - the UID graph and href assignment (the multi-pass order is load-bearing) |
| `lib/validate.mjs` | the 5-of-11 blocking gates |
| `lib/includes.mjs` | include loading + the `:::code` snippet resolver |
| `lib/render/site.mjs` | the shared view-model: publication gate, render context, taxonomy, nav |
| `lib/render/landing.mjs` | the home, training, documentation, and browse pages |
| `lib/render/pages.mjs` | the learning-path, module, unit, and doc page renderers |
| `lib/projections.mjs` | the `_api/*.json`, `llms.txt`, and search-index targets |

The stylesheet is modular the same way: the source was one 2700-line file, so it
is split into ordered partials under `tools/assets/css/` (`01-faces`, `02-tokens`,
`03-base`, `04-masthead`, `05-shell`, `06-article`, `07-cards`, `08-quiz`,
`09-home`). `projections.mjs` concatenates them in filename order into a single
served stylesheet - one request, no cascade change.

The two changing assets - the assembled stylesheet and `app.js` - are emitted
under a **content-hashed** name (`style.<hash>.css`, `app.<hash>.js`), and the
shell references those names. A byte change is therefore a new URL, so a deploy
is never masked by a CDN serving a stale copy of a stable name; the hashed files
are pinned `immutable`. Fonts, favicon, and `og.png` keep fixed names - their
bytes do not change build to build.

Both splits are a pure structural refactor: the emitted `_site/` is byte-for-byte
identical to the pre-split monolith, verified by hashing the full output tree.

## See also

- [Design language](design-language.md) - the visual contract this build emits.
- [Engine architecture](engine-architecture.md) - the target pipeline.
- [Content lifecycle](content-lifecycle.md) - how content stays in sync.
- [Authoring guide](authoring-guide.md) - the extension set this build parses.
