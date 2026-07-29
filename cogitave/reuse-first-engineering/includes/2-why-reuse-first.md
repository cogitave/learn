## The problem is measured, not anecdotal

GitClear's 2025 analysis of 211M changed lines found copy/pasted code rising from
8.3% (2020) to 12.3% (2024), while refactored ("moved") code collapsed from ~25%
to under 10% - in 2024, cloned code **surpassed refactored code for the first
time**, duplicate blocks up roughly 8x. The mechanism is structural: an LLM
generates by statistical prediction, so similar problems yield
similar-but-not-identical solutions, and most AI review tooling only sees the
diff - a freshly generated helper that already exists elsewhere is invisible to
it. Without a deliberate counter-force, more AI means more divergence. Full
evidence and citations: [AI-Native Development](../../../../standards/docs/standards/ai-native-development.md).

## The hard rule: discover before generate

This is the development-time analogue of capability default-deny: the default is
*reuse*, and "write new" is the privileged path that must be justified. The order
of operations for any feature:

1. **Discover** - `component_search` / `pattern_search` / `find_similar` over MCP.
2. **Compose** - if a golden component or primitive matches above the repo's
   similarity threshold, assemble from it. Styling is **semantic tokens only**.
3. **Justify + author** - only if nothing fits: a short design review decides
   whether a *new* primitive is warranted, and it is built once, in the shared
   library.
4. **Contribute back** - published to the library and projected into the
   registry, so the *next* query finds it.

## One canonical thing to reuse at every layer

A reuse rule is only enforceable if there is exactly one canonical thing to
reuse at each layer, queried through a single MCP-native registry that is a
**projection of the canonical model, not a new engine**: in Cogitave's estate the
`ui`/`design` catalogs publish
`Component`/`Primitive`/`Pattern`/`Token` entities that designers, developers,
and agents all query identically.

| Layer | What | Rule |
| --- | --- | --- |
| **Tokens** | color/space/type/motion + a semantic alias layer | Components consume `semantic.*` only - never a literal hex/px - so a re-theme is a re-point of the alias, not a hunt through every component. |
| **Primitives** | headless behavior + accessibility, token-styled | Assemble behavior; never reimplement keyboard/focus/ARIA. |
| **Golden components** | canonical, versioned, accessibility-complete compositions (Button, Field, DataTable, Form, Dialog, ...) | **One** way to render each concept. Agents compose these; they do not author rivals. |

## The anti-duplication gates

Discovery is the carrot; these keep divergence out of `main` - symmetric with
"if code changes, docs change," the rule here is *"if code is added, reuse is
proven"*:

- **`no-duplication` CI gate (required check).** Token-level **jscpd** plus
  AST/semantic **similarity-ts** fail a PR above the repo's duplication
  threshold.
- **Reuse review (PR expectation).** A PR must cite the registry query that
  justified new code; rejecting a needless re-author is a reviewer's job.
- **AGENTS.md** points every repo at the primitives with a decision table
  ("need a table? -> `cogitave.ui.component.data-table`").
- **Eval gate.** The reuse metric fails an agent that regenerates a component
  when a registry match existed, exactly as a safety regression would.

> [!NOTE]
> Per [ADR-0003](../../../../standards/docs/decisions/0003-build-from-scratch-reference-not-dependency.md),
> jscpd and similarity-ts are the **reference to port** to a native checker on
> the canonical model. The next unit covers that same port-then-rebuild discipline
> for whole engines and tools, not just components.
