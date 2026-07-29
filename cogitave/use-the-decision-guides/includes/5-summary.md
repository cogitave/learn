You now know that an AI-native org can answer "which database, which
infrastructure, which model" the same way every time: a stated default, a real
decision tree, and a deviation rule gated on a measured need and an ADR - never
per-team taste, and never guessed from memory. Cogitave's own decision guides,
this module's worked example, do exactly that.

In this module, you:

- Learned the **three-layer guidance model** from ADR-0021: selection guides
  say *which* family for *which* workload, the technology radar says *what*
  is adopted, and the domain standards say *how* to build with the choice.
- Learned the **shared shape** every decision guide follows - a default, a
  walkable decision tree, a machine-readable matrix an agent can query, and a
  deviation rule that requires a measured ceiling recorded in an ADR (or, for
  model selection, an eval).
- Walked the database selection tree to Cogitave Core's query layer for a
  full-text search need, the infrastructure selection tree to a container on
  managed Kubernetes for a long-running service, and the model selection
  posture to the most capable tier for a new, correctness-critical task.
- Learned that landing on the default needs **nothing recorded**; only leaving
  it does, and you now know exactly what that record must state.

That completes the four modules of the "Patterns and golden paths" path:
reuse-first engineering, navigating the patterns catalog, inheriting the
project baseline, and now using the decision guides to make a justified
technology choice.

## Next steps

- @cogitave.learn.paths.patterns-golden-paths - return to the path to claim
  your trophy.
- **ADR-0021** is the full decision that governs all three guides, worth a
  re-read.
- The **model selection** standard, in the estate's standards repository, has
  the cost levers and the eval-gated routing rule; revisit it before your
  next production model choice.
