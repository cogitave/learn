You can now shape a Cogitave contract surface and evolve it without breaking the
people and agents that depend on it.

In this module, you:

- Separated the two questions Cogitave keeps apart: how a contract is **shaped**
  ([API design standard](../../../../standards/docs/standards/api-design.md)) and
  how it **changes over time**
  ([versioning-and-deprecation standard](../../../../standards/docs/standards/api-versioning-and-deprecation.md)),
  settled by [ADR-0019](../../../../standards/docs/decisions/0019-api-design-and-design-system.md)
  (design) and [ADR-0015](../../../../standards/docs/decisions/0015-api-versioning-deprecation-and-product-core-baseline.md)
  (versioning) respectively.
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

- [API design standard](../../../../standards/docs/standards/api-design.md) - the
  canonical detail on modeling, errors, pagination, idempotency, and per-protocol
  conventions; read it before you author a surface.
- [Versioning and deprecation standard](../../../../standards/docs/standards/api-versioning-and-deprecation.md) -
  the full lifecycle, the N-version window, and the deprecation manifest schema.
- [ADR-0019](../../../../standards/docs/decisions/0019-api-design-and-design-system.md) -
  the design decision and the alternatives it rejected, if you want the reasoning
  behind one shape across four protocols.
- [ADR-0015](../../../../standards/docs/decisions/0015-api-versioning-deprecation-and-product-core-baseline.md) -
  the versioning-and-deprecation decision that governs how a contract changes.
