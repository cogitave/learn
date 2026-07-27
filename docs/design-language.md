---
uid: cogitave.learn.docs.design-language
title: Design language - learn.cogitave.com
description: The visual contract for the Cogitave knowledge platform - the four-step type scale, the monochrome text ramp and single accent, the radius and icon systems, the three-track layout, and the component inventory every emitted page is assembled from.
type: reference
owner: cogitave/platform
lastReviewed: 2026-07-25
products:
  - cogitave-core
roles:
  - developer
  - designer
  - platform-engineer
level: intermediate
visibility: internal   # engineering document: stays in git, not published
status: draft
---

# Design language - learn.cogitave.com

This is the visual contract for the knowledge platform. It is normative: the
stylesheet at `tools/assets/style.css` and the shell at `tools/lib/layout.mjs`
implement it, and a change to one without the other is a defect.

The surface has two jobs at once. It is a **product** - a person reads a unit,
answers a knowledge check, moves to the next one - and it is **evidence**, since
the corpus it renders is the corpus an agent queries over MCP. Nothing on the
page may imply a capability the build does not have.

## 1. Where the language comes from

Cogitave already has a public surface: the marketing site. Its discipline
carries over unchanged.

| Inherited | How it shows up here |
|---|---|
| One accent, never two | A single accent token; hue does no work that weight or a rule can do |
| Hairline structure | 1px rules separate sections; no shadows outside overlays |
| Tight tracking | -0.15px, set once and inherited |
| Restraint over ornament | No gradients, no illustration, no decorative colour |
| Hairline icons, `currentColor` | One 16-unit grid, stroke 1.5, round caps |

What deliberately does **not** carry over is the marketing surface's squared
geometry and its single-viewport, no-scroll stage. A docs product is read, not
performed: it is rounded, it scrolls, and it puts navigation ahead of drama.

## 2. Type

**Four sizes. Nothing else.**

| Size | Role |
|---|---|
| 24px / 500 | Page title (`h1`), one per page |
| 14px / 400 | Body prose, card titles at 500, `h2` at 500 |
| 13px / 400 | Secondary prose, navigation, buttons, table cells, `h3` at 500 |
| 12px / 400 | Metadata, breadcrumbs, labels, counters, captions |

**Two weights: 400 and 500.** There is no semibold and no bold; `<strong>` is
500. Anything that looks like it needs 600 needs a rule or more space instead.

**Letter spacing is -0.15px** everywhere, declared once on `body`. There is one
documented exception: the uppercase monospaced callout label, which sets
`0.06em` because uppercase monospace closes up badly at a negative value. It is
a label, not prose. Do not add a second exception without adding it here.

The consequence is deliberate and is the hardest rule to keep: because `h2` and
body copy are the same size, **heading rank is carried by weight, by the hairline
rule above the heading, and by space** - never by a fifth size. Reviewers should
reject any new `font-size` that is not one of the four.

Two self-hosted faces, latin subset only, 233 KB in total:

| Family | Used for | What it is |
|---|---|---|
| `CG Pro` | Everything | SF Pro Text, 400/500 upright and italic |
| `CG Pro Display` | The 24px page title only | SF Pro Display 500 - the optical cut drawn for 20px and up |
| `CG Mono` | Code, counters, labels | JetBrains Mono 400/500 |

`CG Pro` and `CG Mono` are **distribution names**, not authorship claims. The
provenance and licence position of each file, and the command that produced the
subsets, are recorded in `tools/assets/fonts/README.md`; the `name` tables
inside the binaries are untouched. `CG Mono` is a subset, which the SIL Open
Font License treats as a modified version and therefore *requires* to carry a
name other than the original - so the rename there is compliance, not
preference.

Nothing is fetched from a third party at run time. Two faces are preloaded
(`cg-pro-text-400`, `cg-pro-text-500`); everything uses `font-display: swap`, so
a docs page is readable before the face arrives. The fallback chain
(`-apple-system`, Segoe UI Variable, `system-ui`) only covers that window.

## 3. Colour

The hierarchy is monochrome. Three text steps do all of it:

| Token | Light | Dark | Role |
|---|---|---|---|
| `--t1` | `#292929` | `#ECEBE4` | Body prose, headings, links, active states |
| `--t2` | `#5D5D5D` | `#A3A29C` | Supporting prose, summaries, metadata, inactive navigation |
| `--t3` | `#9E9E9E` | `#6F6E6A` | Icons, separators, counters, placeholders |

> [!IMPORTANT]
> `--t3` on the light surface is roughly 2.8:1 against white and **fails WCAG AA
> for text**. It is therefore restricted to decoration - icon strokes,
> breadcrumb separators, list markers, ordinal counters, input placeholders -
> and to values that are also stated elsewhere on the page. Any text a reader
> must be able to read is `--t2` or better. `--t2` is about 7:1 and `--t1` about
> 13.5:1 on white.

There is exactly **one accent**: `#292929` on light, `#E6E2D4` - the marketing
ivory - on dark. It carries the primary call to action, the active navigation
bar, the progress fill, and the selected tab. The two themes are the same brand
seen under different light, which is why the ivory only appears where it can
actually hold contrast.

**Callouts carry no hue at all.** A tinted box with a coloured left bar is the
default every documentation template reaches for, and it reads as decoration
bolted onto the page. Here a callout is a *labelled band*: a rule opens it, a
monospaced label sits in a 104px gutter, and the prose keeps the measure it had
a paragraph earlier - so an aside stays part of the document. The kind is
carried by the mark and the word. The two hazard kinds (warning, caution) invert
their label to a filled chip, which is still monochrome but cannot be skimmed
past. The five hue tokens remain defined and are used only where a state is
genuinely binary: a right or wrong quiz answer, a completed copy.

Both themes ship. The stored choice is applied by an inline script before first
paint so the page never flashes; with no stored choice the OS preference wins.

## 4. Geometry

| Radius | Applies to |
|---|---|
| 8px | Navigation items, icon buttons, inputs, code frames, alerts, tabs, choices |
| 16px | Cards, panels, the search popover, pager links |
| Pill | The primary call to action, progress track, award marks |

Spacing is a 4px grid: 4, 8, 12, 16, 24, 32, 48, 64. Hairlines are 1px
`--line`; `--line-strong` is reserved for hover and focus states.

## 5. Iconography

One family, defined in `tools/lib/icons.mjs`: a 16-unit grid, `currentColor`
only, no fills, **stroke 1.5 at every size**, round caps and joins.

- **14px** - navigation, breadcrumbs, inline affordances, metadata rows.
- **20px** - card marks and section heads.

No other size exists. An icon never carries meaning alone; it always sits beside
a text label.

## 6. Information architecture

The site has three regions and one axis system, and every page belongs to
exactly one region.

| Region | Landing | What it holds |
|---|---|---|
| Documentation | `/documentation/` | Reference material, grouped by Diataxis type - what a page is *for*, not what it is *about* |
| Training | `/training/` | Learning paths, modules, units |
| Browse | `/browse/` | The taxonomy, plus the full catalogue |

**The taxonomy is generated, never hand-kept.** Every path, module, and doc
already declares `products`, `roles`, `levels`, and `subjects`; the build turns
each distinct value into a real page at `/browse/<axis>/<value>/`. A new product
becomes a browse page the moment content declares it, and nothing in the engine
needs to know its name. Chips carry counts so a reader can see what is behind a
link before following it.

Two rules keep that honest:

- **Internal building blocks are not products.** Values in the build's internal
  list (today: `cogitave-core`) are tagged on content for traceability but never
  become a public facet. No vendor publishes a landing page for the substrate
  underneath its products. The pages stay reachable; the value does not become
  a way in.
- **A trailing site name is dropped for display.** Authors suffix doc titles
  with `- learn.cogitave.com` so a search result carries context; on the site
  that context is the site, so repeating it down every sidebar row is noise.
  Only a *trailing* match is removed, so a title that genuinely reads
  "... learn.cogitave.com in sync with the estate" is left exactly as written.

The home page states what each region is for and hands over. It does not
reprint the catalogue: a landing page that lists everything teaches a reader
nothing about the shape of what they are looking at.

## 7. Layout

The masthead is **two tiers**. The upper tier is the whole property and never
changes: brand, the three regions, search, theme. The lower tier is the region
you are inside and changes with it. One tier cannot do both jobs - it either
lists everything and stops being navigable, or lists the top level and leaves
you with no way across the region you are actually in.

Below it, a three-track grid, and the tracks retract in a fixed order as width
is lost:

```text
| side nav 268 |  article <=720  | rail 232 |   >=1181px
| side nav 268 |  article        |              <=1180px  (rail drops)
|              |  article        |              <= 900px  (side nav becomes an overlay)
```

- **The shell uses the whole viewport.** There is no centred container: the
  side navigation sits against the left gutter and the rail against the right,
  the way a reference surface should. What is capped is the *prose*, at the
  measure; the slack falls to the right of the text, inside its own track.
  Blocks that earn the room - tables, card grids, diagrams - take it.
- The masthead is 56px per tier, sticky, hairline-bottomed, and translucent.
- **The tracks are always reserved.** A page without a side navigation still
  leaves that column empty rather than sliding its article 268px to the left; a
  path page and the unit page it links to must begin at the same x. The index
  surfaces (home, browse) opt out into a single centred column of 1120px.
- The article measure is capped at 720px.
- Side navigation and rail are independently sticky and scroll on their own.
- Card grids are a **fixed** column rank - two inside an article, three on the
  home page, one below 860px. Never `auto-fit`: a single card must stay
  card-sized rather than stretch across the page.

## 8. Component inventory

Every emitted page is assembled from this set, and only this set. Adding a
component means adding it here first.

| Component | Where it lives | Notes |
|---|---|---|
| Masthead | `layout.mjs` | Upper tier: brand, the three regions, search, theme, section-nav trigger |
| Contextual bar | `layout.mjs` | Lower tier: the region you are in and everything else at that level |
| Search | `layout.mjs` | One control, compact in the masthead and promoted on the home page; both read the same emitted index |
| Landing card | `layout.mjs` | Heading, promise, three real entries, one way deeper - the home page's unit of structure |
| Closing band | `style.css` | One statement plus one call to action; at most one per page |
| Breadcrumbs | `layout.mjs` | 12px, chevron separators, last item is `aria-current` |
| Side navigation | `layout.mjs` | The whole region, grouped and collapsible, with counts; current item gets a 2px accent bar and 500 weight. A "find by title" filter appears once a section passes five entries |
| Progress | `layout.mjs` | Position within a module, expressed as a 2px track and a count |
| On-page rail | `layout.mjs` | `h2`/`h3` extracted from rendered HTML; scroll-spied |
| Card | `layout.mjs` | 20px mark, title, three-line clamped summary, metadata row |
| Index rank | `layout.mjs` | The taxonomy set as a directory: axis in a fixed gutter, values as ruled two-column rows with the count set right. Replaced a pill cloud, which gave every value the same weight and left half the page empty |
| Diagram | `markdown.mjs` | A mermaid figure that may outgrow the measure and scrolls inside its own frame |
| Fact strip | `layout.mjs` | Units, duration, level - key/value pairs under a title |
| Unit rank | `build.mjs` | The ordered unit list on a module page |
| Award | `layout.mjs` | Badge or trophy, at the end of a module or path |
| Call to action | `style.css` | Solid pill, plus a ghost variant; one solid CTA per view |
| Pager | `layout.mjs` | Previous / next within a module |
| Alert | `markdown.mjs` | The five learn-pr kinds |
| Code frame | `markdown.mjs` | Language, source path when pulled by reference, copy control |
| Table | `markdown.mjs` | Bordered, sunken header, scrolls inside its own container |
| Tabs | `markdown.mjs` | Underline-marked, 13px |
| Knowledge check | `build.mjs` | Answerable; see below |
| Footer | `layout.mjs` | Brand block, three generated link columns, build line |

## 9. Motion

Motion confirms a state change and nothing else. 140-160ms on colour and
background, 200ms on layout shifts, easing `cubic-bezier(0.23, 1, 0.32, 1)` -
the marketing surface's curve. There are no entrance animations, no parallax,
and no scroll-triggered reveals. `prefers-reduced-motion: reduce` collapses
every duration to nil.

## 10. Accessibility

- A skip link precedes the masthead.
- Every interactive element is a real `button` or `a` and is keyboard reachable;
  `:focus-visible` draws a 2px accent outline at 2px offset.
- Landmarks: `header`, `nav` (each labelled), `main`, `aside`, `footer`.
- Icons are `aria-hidden`; the label beside them carries the meaning.
- `--t3` is never used for text a reader must read (section 3).
- The page is complete without JavaScript. `app.js` is deferred and only
  upgrades behaviour that already has a static fallback: without it the
  knowledge check shows every explanation at once and says so, tabs render as
  the first panel, the copy control is inert, and search is absent rather than
  broken.

## 11. What this document does not yet cover

Recorded so the gaps are not mistaken for decisions:

- **No design tokens package.** `design-system.md` binds docs surfaces to
  `cogitave/ui`, which is README-only today. The custom properties here are
  named after the semantic roles they will map onto when it ships. Tracked as
  deviation D3 in [build-v0](build-v0.md).
- **No syntax highlighting.** Code frames are monochrome. Highlighting needs a
  grammar set, and picking one is a supply-chain decision, not a styling one.
- **One third-party runtime asset.** Diagrams are rendered by a pinned,
  self-hosted mermaid build (2.5 MB), fetched *only* by a page that contains a
  diagram - most pages never request it, and nothing is loaded from a CDN.
  Rendering at build time would need a headless browser in the build, which is
  a heavier dependency than the one it removes. Without scripting the diagram
  definition stays on the page as preformatted text. This is the single
  exception to the engine's zero-dependency rule and it is deliberate.
- **No open-graph imagery**, no per-page share cards.
- **No completion state.** Progress reflects position within a module, not what
  the reader has finished; there is no account and nothing is stored.
- **No localisation.** The estate is English-only by policy, so no bidi or
  CJK-metric work has been done.

## References

- [Build v0 - what is implemented, and every deviation](build-v0.md)
- [Knowledge Platform - Engine Architecture](engine-architecture.md)
- [Authoring guide](authoring-guide.md)
- WCAG 2.2 contrast minimum (1.4.3) - <https://www.w3.org/TR/WCAG22/#contrast-minimum>
