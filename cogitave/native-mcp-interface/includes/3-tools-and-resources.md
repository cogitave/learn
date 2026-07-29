## The tools

A native MCP surface exposes the canonical model as a small, typed set of tools
plus direct resource addressing - not one general query endpoint. Cogitave's Core
is the worked instance:
[mcp-interface.md §2](../../../../core/docs/mcp-interface.md#2-tools) defines
eight query tools plus five request-lifecycle tools (two of them propose-only
writes), all declaring both an `inputSchema` and an `outputSchema` and returning
structured content alongside a text rendering:

| Tool | Purpose |
| --- | --- |
| `docs_search` | Hybrid retrieval (BM25 + vector + graph rerank) over Doc/Article/Unit/Module/LearningPath/ADR nodes. |
| `docs_fetch` | Fetch a node's full canonical content by UID - a catalog read. |
| `code_sample_search` | Search compile-checked `:::code` samples across the corpus. |
| `get_related` | Typed-edge neighborhood of a node - `partOf`, `dependsOn`, `xref`, and the rest of the closed edge vocabulary. |
| `get_learning_path` | Prerequisite-ordered Units/Skills toward a target competency - the same traversal that ordered this very path. |
| `resolve_xref` | Resolve an `@uid` / `<xref:uid>` to its current URI and title, moniker-aware. |
| `query_graph` | A bounded, read-only property-graph query over the closed node/edge vocabulary. |
| `describe_schema` | Returns the closed vocabulary itself - node labels, typed edges, required attributes, monikers. |

`describe_schema` is worth a second look: it is documented as the **first call
in agent onboarding**, because an agent that already knows the vocabulary can
plan a multi-hop query instead of dumping the estate just to find its footing.

`query_graph` is the one tool that could become a general escape hatch, so it
is deliberately fenced by the **bounded graph-query profile**: read-only (no
mutation or DDL), an allowlisted set of node/edge labels, a capped traversal
depth (`*1..4`), a hard row cap (`limit` ≤ 1000, with a `truncated` flag), a
per-query timeout, and a guard against traversal blow-ups. A violation of any
bound returns a tool error rather than a silently truncated result. That
read-only, hard-bounded shape is the transferable lesson - a graph-query tool is
a raw query surface, so it earns its safety from enforced limits, not from
caller discipline.

## Resources

Every node in the graph is also addressable directly, as an MCP **resource**, on
a URI template - in Cogitave's instance, `cogitave://{type}/{id}` - for example
`cogitave://doc/cogitave.core.architecture` or
`cogitave://request/req-2026-0042`. `resources/templates/list` advertises that
template with per-type title, description, `mimeType`, and an icon;
`resources/list` paginates the catalog with `type`/`product` filters;
`resources/read` returns the node payload plus a `contentHash` and
`lastModified`. You can `resources/subscribe` to one node or to a whole
`cogitave://{type}/` collection, and on a content change the server pushes
`notifications/resources/updated` (and `list_changed` when the resource set
itself changes) - the live-invalidation ADR-0003 promised over polling.

## Reads are open, writes only propose

The request-lifecycle tools - `list_requests`, `get_request`, `get_dod`,
`request_intake`, `advance_stage` - bind the same
[request lifecycle](../../../../agents/lifecycle/LIFECYCLE.md) a human works to
this MCP surface. Reads are unrestricted within a caller's grant, but
`request_intake` and `advance_stage` are **propose-only**: they validate an
intake form or a stage transition, open the corresponding GitHub issue or PR,
and stage a **draft** `Request` node - they never mutate protected state or
apply anything, honoring AGENTS.md's "no unapproved mutation." That
propose-only split - open reads, writes that only ever draft - is the pattern to
carry into any org's MCP surface, not just Cogitave's.
