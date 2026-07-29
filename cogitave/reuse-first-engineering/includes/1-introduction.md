In an AI-native org, agents write most of the code - `yuva`/`namzu` and external
coding agents alike. Left to itself, that is a liability. A large language model generates by
statistical prediction: the same problem, asked twice, yields two similar-but-not-
identical solutions. Most AI review tooling only sees the diff, so a freshly
generated helper that already exists elsewhere is invisible to it. Unchecked,
**more AI means more divergence** - a fourth Button, a near-duplicate date
formatter, a service that reinvents a primitive three repos already have.

An AI-native org that is agent-first and **full-scratch over one canonical model**
- Cogitave's own is [Cogitave Core](../../../../core/docs/architecture.md) - cannot
treat divergence as a style nit; it undercuts the very thing that makes an estate
harmonic. The counter-force is deliberate: **retrieval before generation**. Cogitave
codifies that operating model in its
[AI-Native Development standard](../../../../standards/docs/standards/ai-native-development.md)
(decision: [ADR-0013](../../../../standards/docs/decisions/0013-reuse-first-convergent-ai-development.md)).

> [!IMPORTANT]
> Before authoring any UI or code, every agent and every human MUST query the
> registry and the design system for an existing fit. **Authoring something new
> is the exception**, requires a recorded "no fit" justification, and is
> contributed back to the shared library - never kept as a local fork.

The same discipline applies one level up, to whole engines and tools, not just
components: [ADR-0003](../../../../standards/docs/decisions/0003-build-from-scratch-reference-not-dependency.md)
governs when "build it ourselves" is actually earned versus when it is blind
reinvention of a problem the industry already solved well.

## What you will get from this module

- **Why reuse-first, and what enforces it** - the discover-before-generate hard
  rule, the tokens-to-primitives-to-golden-components single source of truth, the
  MCP-native registry, and the anti-duplication gates that keep a needless
  re-author out of `main`.
- **Build from scratch as the exception** - ADR-0003's port-best-in-class,
  rebuild-native stance: references are studied and ported, not reinvented
  blindly, and a from-scratch rebuild has to be materially earned.

By the end, you will be able to state the hard rule, name what enforces it, and
justify a from-scratch decision the way an AI-native estate's own ADRs require -
as a reasoned exception, never a default.
