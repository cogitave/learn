The catalog lives in two forms that describe the same set of patterns: a human
document and a machine-readable index. Both are read from
[patterns/README.md](../../../../standards/docs/patterns/README.md).

## The five-section entry shape

Every pattern doc - `service-scaffold.md`, `api-endpoint.md`, `caching.md`, and
the rest listed in the README's catalog table - has the **same five sections, in
this order**:

| Section | What it tells you |
| --- | --- |
| **Problem** | When you reach for this pattern. |
| **The canonical way** | The one canonical solution, concretely. |
| **Governing standard(s)** | The authority - the rules live there, not here. |
| **Reusable artifact** | The template, primitive, or snippet to start from. |
| **Anti-pattern** | What agents most often wrongly generate instead. |

Cogitave's own catalog labels the canonical-solution row **The Cogitave way**; in
your estate it would carry your org's name. Read
[service-scaffold.md](../../../../standards/docs/patterns/service-scaffold.md)
end to end and you can feel the shape: the Problem names the temptation to
`git init` an empty repo; the Cogitave way says scaffold from `templates/base`
plus a language template instead; the governing standards are
`product-architecture`, `product-core-baseline`, `technology-radar`, and
`ci-cd-pipelines`; the reusable artifact names `templates/base` composed with
`templates/service`, `templates/go-service`, or `templates/rust`; the
anti-pattern is hand-rolling a repo from a blank directory and re-picking a
toolchain ad hoc.

## The machine-readable index

[`catalog.yaml`](../../../../standards/docs/patterns/catalog.yaml) is the
authoritative, MCP-consumable projection of the same catalog. Each entry carries
`uid`, `problem`, `governing_standard` (a list of `uid` + `path`),
`reusable_artifact` (`kind` + `path`), and `anti_pattern` - the same five ideas,
structured for a query instead of a read. An entry may also carry an optional
`canonical_pattern` field pointing back at a five-section doc: `new-repo`,
`new-service-rust`, `new-service-go`, and `new-library` are four different
task-level intents that all set `canonical_pattern` to `service-scaffold.md`,
because they are variations on one canonical write-up, not four separate
policies. When an entry has no `canonical_pattern`, its `catalog.yaml` fields
*are* the pattern - there is no separate prose doc to open.

> [!NOTE]
> Both forms are the **same** projection of the canonical model - Cogitave Core -
> queried the same way a human or an agent would: `docs_search` or `query_graph` over the
> [query layer](../../../../core/docs/query.md) and the
> [MCP interface](../../../../core/docs/mcp-interface.md). There is no second,
> private index - see [ADR-0022](../../../../standards/docs/decisions/0022-patterns-catalog-and-project-inheritance.md)
> part D.

Whichever form you open, read the same way: get the Problem and the canonical way
for orientation, then treat the Governing standard and the Reusable artifact as
the two links that matter - everything else is a pointer to one of those two.
