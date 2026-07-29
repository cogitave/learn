You can now shape a contract surface and evolve it without breaking the
people and agents that depend on it.

In this module, you:

- Separated the two questions an AI-native org keeps apart: how a contract is **shaped**
  (the API design standard) and how it **changes over time** (the
  versioning-and-deprecation standard), settled by ADR-0019 (design) and
  ADR-0015 (versioning) respectively.
- Designed **contract-first**, modeling resources with standard methods, one
  canonical casing per place, and a custom method only when an action is not CRUD.
- Applied the non-deviable invariants - the **RFC 9457** error model with a
  stable `code`, **cursor pagination** with bounds, and **idempotency** on
  creating writes - and learned that one concept has one shape across HTTP, gRPC,
  GraphQL, and MCP.
- Picked the right versioning scheme per surface, kept changes **additive**, and
  walked a contract through `preview -> active -> deprecated -> sunset -> retired`
  with one manifest keeping the API, docs, and changelog in lockstep - under
  **never break userspace without consent**.

## Next steps

- @cogitave.learn.configuration-management - the next module in **Engineering standards for an
  AI-native org**, on classifying config from secrets and keeping both
  out of git.
- The **API design standard** is the canonical detail on modeling, errors,
  pagination, idempotency, and per-protocol conventions - the source of truth
  in the estate's standards repository; read it before you author a surface.
- The **versioning-and-deprecation standard** is the canonical reference for
  the full lifecycle, the N-version window, and the deprecation manifest
  schema, in the same repository.
- **ADR-0019** and **ADR-0015** are the estate's recorded decisions: ADR-0019
  settled one shape across four protocols, and ADR-0015 settled how a
  contract changes over time.
