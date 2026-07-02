# learn — content source for learn.cogitave.com

Follows the Microsoft Learn `learn-pr` convention **exactly** (see [documentation standard](../standards/docs/standards/documentation.md)). The engine is ours, built from scratch (yuva/Rust serve + namzu/TS build); the **format is the standard** (portability + certification fit).

## Structure
```
learn/
├─ achievements.yml                    # ### YamlMime:Achievements (badge/trophy)
├─ docs.config.json                  # build config (docfx.json analog)
├─ <product>/                          # e.g. cogitave/, yuva/, namzu/
│  ├─ <module-slug>/
│  │  ├─ index.yml                     # ### YamlMime:Module
│  │  ├─ 1-<unit>.yml … N-<unit>.yml   # ### YamlMime:ModuleUnit
│  │  └─ includes/<N>-<unit>.md        # each unit's prose (separate)
│  └─ <path-slug>/index.yml            # ### YamlMime:LearningPath
└─ docs/                               # engine spec + authoring guide (Diátaxis, front matter)
```

## Rules (standard)
- **Linked by UID xref**, no physical nesting: `Module.units[]` = ModuleUnit UIDs; `LearningPath.modules[]` = Module UIDs.
- Prose always lives in a separate `.md` under `includes/` (never embedded in the unit yml).
- Knowledge-check = structural YAML (`quiz` → questions → choices{isCorrect, explanation}).
- Achievement uid: badge → `…​.badge`, trophy → `…​.trophy`.
- Metadata: ISO-8601 dates (we improve on Learn's MM/DD/YYYY).

### UID namespace convention
UIDs are immutable and decoupled from the physical path. Reserve a stable namespace per training type so the UID graph stays unambiguous:

| Type | UID shape | Achievement |
| --- | --- | --- |
| Learning path | `cogitave.learn.paths.<path-slug>` | trophy → `cogitave.learn.paths.<path-slug>.trophy` |
| Module | `cogitave.learn.<module-slug>` | badge → `cogitave.learn.<module-slug>.badge` |
| Unit | `cogitave.learn.<module-slug>.<unit-slug>` | — |

The `cogitave.learn.paths.*` namespace is **reserved for learning paths**; never give a module a `paths.` UID. Code snippets are not UID nodes — see the [snippet registry](snippets/).

## What's here

### Learning path
- [`cogitave/agent-platform-fundamentals/`](cogitave/agent-platform-fundamentals/) — `### YamlMime:LearningPath`, uid `cogitave.learn.paths.agent-platform-fundamentals`, trophy `cogitave.learn.paths.agent-platform-fundamentals.trophy`. Sequences the two modules below.

### Modules
- [`cogitave/get-started-with-yuva/`](cogitave/get-started-with-yuva/) — the Yuva agent operating system (run your first agent). Badge `…​.get-started-with-yuva.badge`.
- [`cogitave/build-your-first-agent-with-namzu/`](cogitave/build-your-first-agent-with-namzu/) — build an MCP-native agent with the Namzu kernel (intro → what-is-namzu → exercise → knowledge-check → summary). Badge `…​.build-your-first-agent-with-namzu.badge`.

### Engine + authoring docs
- [`docs/engine-architecture.md`](docs/engine-architecture.md) — the from-scratch engine spec: ACQUIRE→PARSE→ENRICH→INDEX→EMIT→PUBLISH, content-addressed incremental builds, monodocs aggregation, schema-DSL, native MCP, edge-first search.
- [`docs/authoring-guide.md`](docs/authoring-guide.md) — how authors write content: the extension set (alerts, includes, `:::code`, tabs, `:::image`, zone pivots, monikers, xref), metadata, Diátaxis mapping.

### Build config
- [`docs.config.json`](docs.config.json) — content roots, metadata defaults, moniker registry, validation rules (schema + broken-xref/link = **blocking**), output targets (HTML + JSON content API + MCP + `llms.txt`).

> The full knowledge platform (build/serve/index/MCP) is task #15. This folder is the content source + the engine/authoring spec + a proof of the convention.
