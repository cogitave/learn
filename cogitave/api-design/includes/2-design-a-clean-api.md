The [API design standard](../../../../standards/docs/standards/api-design.md)
uses RFC 2119 keywords: **MUST/REQUIRED** is non-negotiable, **SHOULD/DEFAULT**
is the opinionated default you ship unless you record a deviation, and **MAY** is
allowed. Design a surface in this order.

## 1. Contract-first: the schema is the source of truth

The contract artifact is authored **before** the implementation, and code is
generated from - or verified against - it, never the reverse. OpenAPI 3.1 for
REST, proto3 for gRPC, SDL for GraphQL, and JSON Schema per tool for MCP. The
artifact lives in the repo and is the diff an auditor reads. Every surface a
product exposes MUST **also** be reachable as MCP - the MCP projection is a
first-class contract, not an afterthought. Contracts MUST be self-describing:
descriptions on every field and method, examples on every operation, so an agent
can discover a surface instead of regenerating it.

## 2. Model resources, then act on them

Default to a **hierarchy of resources (nouns)** acted on by a small set of
standard methods; reach for an RPC-style verb only as a custom method. Paths
alternate collection/id segments and express nesting explicitly, e.g.
`/v1/work-items/{work_item_id}/comments/{comment_id}`. Naming has one canonical
casing per place:

- URL collection segments: lower-kebab-case, **plural** (`/v1/work-items`).
- JSON/proto fields: `snake_case` (`display_name`), so REST and gRPC never
  diverge in casing.
- Enum values: `UPPER_SNAKE_CASE` with a `*_UNSPECIFIED = 0` zero value.
- MCP tool names: `snake_case` `verb_noun` (`create_work_item`).

IDs are server-assigned, opaque, and sortable (ULID or UUIDv7); clients MUST NOT
parse meaning out of them. **`List`/`Get`/`Create`/`Update`/`Delete`/`BatchGet`**
cover CRUD - and nothing bespoke for it. Partial update via `PATCH` + a field
mask is the default; a field absent from the mask MUST NOT be cleared. Non-CRUD
actions (a state transition, a bulk job) become a **custom method** in colon
notation over `POST`: `POST /v1/work-items/{id}:archive`.

## 3. The estate-wide invariants

Some rules are MUST and **not deviable per repo**. Get these right or the design
is wrong:

- **Errors are RFC 9457 typed problems** on every surface -
  `application/problem+json` with `type`, `title`, `status`, `detail`,
  `instance`, plus the Cogitave extensions `code` (a stable error-code enum -
  the machine contract), `trace_id`, `retryable`, and `errors[]` for field-level
  validation. Each `code` maps to a canonical class and HTTP status. Raw panics
  MUST NOT cross the boundary.
- **Cursor pagination by default.** Every `List` takes `page_size` +
  `page_token` and returns `next_page_token`, with an enforced default and
  maximum page size (an unbounded list is a defect). The cursor is opaque and
  signed; offset/limit is a recorded deviation.
- **Idempotency on creating writes.** Every non-idempotent write honors an
  `Idempotency-Key`: a replay returns the original response; a reused key with a
  different fingerprint fails `409`.

## 4. One shape, and the deviation rule

A single concept MUST have **one shape** across REST, gRPC, GraphQL, and MCP -
same fields, enums, `code` taxonomy, and pagination. Divergence is a lint
failure, not a style choice; Spectral, `buf`, and schema linters gate it in CI.
Deviating from a SHOULD/DEFAULT requires an **Accepted ADR/RFC** recording the
reason, a compensating control, and an expiry date. The MUST invariants above are
not deviable at all.
