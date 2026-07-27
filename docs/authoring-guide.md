---
uid: cogitave.learn.docs.authoring-guide
title: Authoring Guide — learn.cogitave.com
description: How to write content for the Cogitave knowledge platform - the schema-validated extension set (alerts, includes, code-by-reference, tabs, images, zone pivots, monikers, xref), required metadata, and the Di-taxis mapping.
type: how-to
owner: cogitave/platform
lastReviewed: 2026-06-27
products:
  - yuva
  - namzu
roles:
  - developer
  - content-developer
level: beginner
visibility: internal   # engineering document: stays in git, not published
status: draft
---

# Authoring Guide — learn.cogitave.com

This guide shows how to write content for `learn.cogitave.com`. The physical layout and Markdown extensions follow the Microsoft Learn `learn-pr` convention **exactly** (portability + certification fit); the engine that validates and serves them is ours. For how that engine works, see the [engine architecture](engine-architecture.md).

> [!IMPORTANT]
> Every rule below is enforced by a **blocking** build gate (schema + broken xref/link/bookmark are errors, not warnings). If it doesn't validate, it doesn't ship.

## 1. Where files go

```
learn/
├─ achievements.yml                       # ### YamlMime:Achievements  (badge + trophy)
├─ <product>/                             # cogitave/, yuva/, namzu/
│  ├─ <module-slug>/
│  │  ├─ index.yml                        # ### YamlMime:Module
│  │  ├─ 1-<unit>.yml … N-<unit>.yml      # ### YamlMime:ModuleUnit
│  │  └─ includes/<N>-<unit>.md           # each unit's prose (separate file)
│  └─ <path-slug>/index.yml               # ### YamlMime:LearningPath
├─ docs/*.md                              # Diátaxis reference/explanation (front matter)
└─ docs.config.json                     # build config
```

Rules that the gate checks:

- **Type on line 1.** Every YAML file starts with `### YamlMime:<Type>`.
- **Linked by UID, not nesting.** `Module.units[]` are ModuleUnit UIDs; `LearningPath.modules[]` are Module UIDs; `badge`/`trophy` UIDs must exist in `achievements.yml`.
- **Prose lives in `includes/`.** A unit's `.md` is referenced, never inlined into the `.yml`.
- **Knowledge-check is structural YAML** (`quiz` → `questions` → `choices{isCorrect, explanation}`).

## 2. Metadata requirements

One front-matter schema per type is the single source for the TypeScript, Rust, and JSON Schema. Required fields:

| Field | Notes |
| --- | --- |
| `title` | Human-readable. |
| `uid` | Immutable dotted ID: `cogitave.<area>.<name>`. The URL may change; the UID never does. Training types use the reserved namespaces below. |
| `description` | 75–300 characters. |
| `type` | Diátaxis mode (§9) — for `docs/*.md`. |
| `owner` | Owning team, e.g. `cogitave/platform`. |
| `lastReviewed` | **ISO-8601** (`2026-06-27`). We improve on Learn's `MM/DD/YYYY`. |
| `products`, `roles`, `level` | From the versioned taxonomy enums. |

Precedence is **front-matter > fileMetadata > globalMetadata** (the last two are defined in [`docs.config.json`](../docs.config.json)). Missing required metadata **fails** the build.

> [!NOTE]
> Learn training types (`Module`, `ModuleUnit`, `LearningPath`) carry their metadata in a `metadata:` block plus top-level training fields (`summary`, `abstract`, `units`, …). Diátaxis docs (`docs/*.md`) carry the front matter above. Both are the same schema engine, different discriminators.

### UID namespaces (training types)

UIDs are immutable and decoupled from the physical path, so each training type gets a reserved namespace. This keeps the UID graph unambiguous and lets the gate tell a path from a module by its UID alone:

| Type | UID shape | Achievement UID |
| --- | --- | --- |
| Learning path | `cogitave.learn.paths.<path-slug>` | trophy → `cogitave.learn.paths.<path-slug>.trophy` |
| Module | `cogitave.learn.<module-slug>` | badge → `cogitave.learn.<module-slug>.badge` |
| Unit | `cogitave.learn.<module-slug>.<unit-slug>` | — |

The `cogitave.learn.paths.*` namespace is **reserved for learning paths** — never give a module a `paths.` UID. The registry is declared in [`docs.config.json`](../docs.config.json) under `build.xref.namespaces`.

## 3. Alerts

Block quotes that render with an icon and color. Five types; use sparingly (one or two per page):

```md
> [!NOTE]
> Information the reader should notice even when skimming.

> [!TIP]
> Optional advice that helps the reader succeed.

> [!IMPORTANT]
> Essential information required for success.

> [!CAUTION]
> Negative potential consequences of an action.

> [!WARNING]
> Dangerous, certain consequences of an action.
```

## 4. Includes

Pull shared or unit prose in by reference. A unit's `content` is almost always a single include:

```md
[!include[](includes/1-introduction.md)]
```

Include edges are tracked by the incremental build: editing the `.md` rebuilds every unit and page that includes it, and nothing else.

## 5. Code by reference (`:::code`)

Prefer referencing a real, compile-checked source file over pasting a snippet, so examples never rot. The reference is a **block** extension and must be on its own line:

```md
:::code language="typescript" source="snippets/greeter/agent.ts" range="1-12":::
:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_tool":::
:::code language="typescript" source="snippets/greeter/agent.ts" range="1-12" highlight="3-5":::
```

- `source` (**required**) — path to the snippet file, resolved from the **snippet registry root** (the content root), e.g. `snippets/greeter/agent.ts`.
- `range` *or* `id` — line range (`1,3-5`) or a named region; they're mutually exclusive.
- `highlight` — lines to emphasize, numbered relative to what's displayed.

### The snippet registry

Code-by-reference sources live in a central **snippet registry** at [`learn/snippets/`](../snippets/) (configured under `build.snippets` in [`docs.config.json`](../docs.config.json), and excluded from the published content set). A registry file is a real, compilable source file; named regions are delimited by **language-native line-comment markers** — `// <id>` … `// </id>`:

```ts
// <snippet_tool>
import { z } from "zod";
import { defineTool } from "@namzu/sdk";

export const GreetTool = defineTool({
  name: "greet",
  description: "Return a friendly greeting for a given name.",
  inputSchema: z.object({ name: z.string().min(1) }),
  category: "custom",
  permissions: [],
  readOnly: true,
  destructive: false,
  concurrencySafe: true,
  async execute({ name }) {
    return { success: true, output: `Hello, ${name}, from your first Namzu tool.` };
  },
});
// </snippet_tool>
```

A unit then pulls that region in by reference (this is the `defineTool` region from the live example in *Build your first agent with Namzu*):

```md
:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_tool":::
```

The `code-snippet-resolves` rule is **blocking**: the `source` must exist in the registry and the `id`/`range` must resolve, or the build fails. Compile-checking of the resolved region is not yet wired into the build (see [`build-v0.md`](build-v0.md)); the registry file is kept compilable and its symbols are hand-verified against the real `@namzu/sdk` surface. When a runnable example must be fully inline (no source file), use a fenced ```` ```ts ```` block instead.

## 6. Tabs

Offer alternatives (transports, operating systems, languages) without duplicating a page. Each tab header is `# [Label](#tab/id)`; close the set with a lone `---`:

```md
# [stdio (local)](#tab/stdio)

Content for the stdio transport.

# [Streamable HTTP (remote)](#tab/http)

Content for the HTTP transport.

---
```

## 7. Images

Always provide alt text; the `alt-text` rule is blocking. Use `type="content"` for simple images and `type="complex"` (with a long description) for diagrams that need an accessible text equivalent — this is an accessibility and certification requirement:

```md
:::image type="content" source="media/topology.png" alt-text="A registered provider routes a chat request through the Namzu kernel to a model.":::

:::image type="complex" source="media/pipeline.png" alt-text="Six-stage build pipeline.":::
   ACQUIRE pulls content through loaders; PARSE produces an AST; ENRICH compiles,
   links, and post-processes; INDEX builds the graph and search; EMIT renders all
   targets; PUBLISH ships to the edge.
:::image-end:::
```

## 8. Zone pivots, monikers, and xref

**Zone pivots** show audience-specific content on one page:

```md
:::zone pivot="typescript"
Namzu (TypeScript) instructions.
:::zone-end

:::zone pivot="rust"
Yuva (Rust) instructions.
:::zone-end
```

**Monikers** version content. A range resolves against the moniker registry in `docs.config.json`; the page is rendered once per applicable moniker:

```md
::: moniker range=">=yuva-2.0"
Applies to Yuva 2.0 and later.
:::moniker-end
```

**Xref** links by UID, so links survive URL changes. Inline `@uid` or the explicit form:

```md
See @cogitave.learn.understand-yuva to start.
See <xref:cogitave.learn.build-your-first-agent-with-namzu>.
```

Every xref must resolve in the UID graph (`broken-xref` is blocking). Wrap product names that must never be localized in `:::no-loc text="Yuva":::`.

## 9. Diátaxis: choosing a `type`

Pick the mode by what the reader is doing — learning vs doing, practical vs theoretical:

| `type` | Reader is… | On the platform |
| --- | --- | --- |
| `tutorial` | learning by doing | a Module's exercise units |
| `how-to` | accomplishing a task | this guide; task `docs/*.md` |
| `reference` | looking something up | schema/config `docs/*.md` |
| `explanation` | understanding why | the engine architecture doc, ADRs |

Don't mix modes in one document: a tutorial that stops to explain theory, or a reference that turns into a how-to, is a sign to split it. The metadata schema enforces that `type` is one of the four modes.

## 10. Before you open a PR

- [ ] Type declared on line 1; required metadata present; `lastReviewed` is ISO-8601.
- [ ] All `@uid` / `<xref>`, links, bookmarks, and `:::code` sources resolve.
- [ ] Knowledge-check questions have ≥2 choices, exactly 1 correct (single-answer), every choice explained.
- [ ] `badge`/`trophy` and every `units[]` / `modules[]` UID resolve.
- [ ] Images have alt text; complex images have a long description.
- [ ] Exactly one Diátaxis mode per document.

## See also

- [Engine architecture](engine-architecture.md) — how the build validates and serves what you write.
- [Documentation standard](../../standards/docs/standards/documentation.md) — the governing standard.
