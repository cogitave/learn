An API is a promise. Once a human, an agent, or another service depends on the
shape of your surface, that shape is a contract you have to honor. An AI-native org takes
two questions that most teams blur together and gives each its own standard: how
a contract is **shaped**, and how a contract **changes over time**.

- The [API design standard](../../../../standards/docs/standards/api-design.md)
  owns the **shape** - resource modeling, naming, standard methods, the error
  model, pagination, idempotency. It says what a good *v1* looks like.
- The [versioning-and-deprecation standard](../../../../standards/docs/standards/api-versioning-and-deprecation.md)
  owns the **evolution** - how that same contract is versioned, deprecated,
  sunset, and retired. It says how a shape *changes* without breaking anyone.

The two are read together and deliberately never restate each other. The design
standard is settled by [ADR-0019](../../../../standards/docs/decisions/0019-api-design-and-design-system.md)
and the versioning standard by [ADR-0015](../../../../standards/docs/decisions/0015-api-versioning-deprecation-and-product-core-baseline.md),
which together fix the interface layer for the whole estate before the first
surface ships.

> [!IMPORTANT]
> **Day-0 honesty.** Most product cores are still being written. These standards
> are the spec each surface conforms to **as it is authored**, enforced by
> linters in CI and gated by the request lifecycle - not a description of shipped
> APIs.

## Why one shape, four protocols

An AI-native org is MCP-native and also speaks HTTP, gRPC, and GraphQL. The design
standard's core bet is that a single concept has **one shape** across all four:
same field names, same enum values, same error taxonomy, same pagination
contract. That is what lets an agent or an auditor read one model instead of
four - and what stops an AI from re-deriving a surface that already exists.

## What you will get from this module

Not a REST-versus-gRPC debate - a working command of the conventions you apply to
design a clean surface, the handful of MUST invariants you can never deviate
from, and the discipline to evolve that surface additively so a live consumer is
never broken without consent.
