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

### Learning paths — 6, all authored and building end to end

**25 modules, 123 units**; every badge/trophy resolves; the MCP server serves the
full corpus. Three modules are **reused** across paths (referenced by UID, never
copied): `apply-the-agents-floor`, `inherit-the-project-baseline`,
`work-the-request-lifecycle`.

| Path (`cogitave.learn.paths.<slug>`) | Modules (in order) |
|---|---|
| `agent-platform-fundamentals` | build-your-first-agent-with-namzu → understand-yuva |
| `contributor-onboarding` | apply-the-agents-floor → inherit-the-project-baseline → work-the-request-lifecycle → open-your-first-pull-request |
| `engineering-standards` | apply-the-agents-floor → apply-naming-standards → commits-and-versioning → testing-and-quality → api-design → configuration-management → secure-sdlc → ci-cd-pipelines → observability-and-reliability |
| `patterns-golden-paths` | reuse-first-engineering → navigate-the-patterns-catalog → inherit-the-project-baseline → use-the-decision-guides |
| `build-on-core` | core-model-fundamentals → query-the-estate-with-cogitave-query → native-mcp-interface → project-products-into-core |
| `operate-the-estate` | work-the-request-lifecycle → run-agentic-operations → reliability-and-sre → respond-to-incidents → operate-from-day-1 |

Every module is a `cogitave/<slug>/` directory (index.yml + 5 units + includes).
`docs.config.json` no longer excludes any path. The curriculum's Tier-0 track map
([`docs/curriculum.md`](docs/curriculum.md) section 2.0) is reconciled to these
reserved UIDs; the wider role/product/topic map there stays the forward target.

### Engine + authoring docs
- [`docs/engine-architecture.md`](docs/engine-architecture.md) — the from-scratch engine spec: ACQUIRE→PARSE→ENRICH→INDEX→EMIT→PUBLISH, content-addressed incremental builds, monodocs aggregation, schema-DSL, native MCP, edge-first search.
- [`docs/authoring-guide.md`](docs/authoring-guide.md) — how authors write content: the extension set (alerts, includes, `:::code`, tabs, `:::image`, zone pivots, monikers, xref), metadata, Diátaxis mapping.
- [`docs/curriculum.md`](docs/curriculum.md) — the curriculum architecture: the track map (role / product / topic), the prerequisite graph, and the authoring roadmap.
- [`docs/content-lifecycle.md`](docs/content-lifecycle.md) — how content stays in sync with the estate it teaches: the three content classes, the `teaches:` metadata contract, moniker versioning, the freshness window, and the `learn-sync` release trigger.
- [`docs/design-language.md`](docs/design-language.md) — the visual contract the build emits: the four-step type scale, the monochrome ramp and single accent, radii, icons, the three-track layout, and the component inventory.
- [`docs/build-v0.md`](docs/build-v0.md) — what the v0 build actually implements, and every recorded deviation from the contract above.

### Build config
- [`docs.config.json`](docs.config.json) — content roots, metadata defaults, moniker registry, validation rules (schema + broken-xref/link = **blocking**), output targets (HTML + JSON content API + MCP + `llms.txt`).

> The full knowledge platform (build/serve/index/MCP) is task #15. This folder is the content source + the engine/authoring spec + a proof of the convention.
