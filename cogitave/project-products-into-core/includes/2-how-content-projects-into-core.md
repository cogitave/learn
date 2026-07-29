Projecting content into a canonical model is not a metaphor. It names a
specific pipeline, a specific identity scheme, and a specific set of edges. This
unit walks all three, using Cogitave's own Core as the worked example, from its
[Core architecture spec](../../../../core/docs/architecture.md).

## The node it becomes

Content lands as one of the model's typed nodes. In Cogitave's Core, for
instance, that is a `Doc` (a Diataxis-typed docs page), an `Article`, a
`Standard`, an `ADR`, or - for this very platform - a `Unit`, `Module`, or
`LearningPath`. Each type has its own JSON Schema, but all share one base schema
and one identity rule, so a standard and a learning unit are queried the exact
same way.

## Two identifiers, two jobs

Every node carries two orthogonal identifiers. The **`uid`** is identity: an
immutable, dotted, globally unique name in one flat namespace across the whole
estate (Cogitave's own read `cogitave.<area>.<name>`, e.g.
`cogitave.core.architecture`), so a URL can change under it without breaking a
single link. The **`contentHash`** is version: a content-addressed digest of the
canonicalized payload, the same Merkle-DAG idea Git and IPFS use - a changed
leaf changes only the hashes on the path back to the root, and two byte-identical
nodes are stored once. (Vector embeddings are deliberately excluded from
`contentHash`, so swapping an embedding model never looks like a content edit.)

## The edges that link it in

A node alone is inert; a **closed set of edge types** is what makes it part of
the graph. Cogitave's Core fixes **eleven** of them, and content-authoring hits
four most: `xref` (a citation, `<xref:uid>` or `@uid`, traversed both ways),
`partOf` (composition - a `Unit` is `partOf` a `Module`, which is `partOf` a
`LearningPath`; this module's own five units are wired this way), `appliesTo` (a
`Standard` governs a `Repo`), and `teachesSkill` (a `Unit` teaches a `Skill`).
The vocabulary is closed on purpose: a fixed set of labels keeps traversal and
faceting stable as the estate grows.

## The pipeline: ACQUIRE to PUBLISH

A source blob becomes a node through a fixed pipeline; Cogitave's Core runs
**ACQUIRE → PARSE → ENRICH → INDEX → EMIT → PUBLISH**. Each acquired blob is
hashed; an unchanged blob short-circuits, and
a changed one recomputes its node's `contentHash` and marks only the
*transitively affected* nodes dirty via the `xref`/`include` edge DAG - the same
on-demand, memoized recompute discipline as `salsa` and Adapton. Schema
validation and broken-xref/link checks are a **blocking** gate: if it doesn't
validate, it doesn't publish. On a green merge, three materializations rebuild
as pure functions of the graph - a UID-keyed catalog, a graph store for
traversal, and a hybrid search index - swapped in atomically behind a new
content root.

## Served identically to humans and agents

Once published, every node is an MCP **resource** - in Cogitave's Core, addressed
as `cogitave://{type}/{id}` (for example `cogitave://doc/cogitave.core.architecture`).
`docs_fetch` returns the node's `uid`, `type`, `title`, rendered content, and its
`contentHash` and `lastModified` - the same [MCP interface](../../../../core/docs/mcp-interface.md)
a human's search box calls underneath. `describe_schema` lets an agent read the
closed vocabulary before it queries, and `resources/subscribe` plus
`notifications/resources/updated` mean a client learns about a changed node
instead of polling for it.

> [!TIP]
> "How does a doc become a queryable node" now has a precise answer: it is
> hashed, typed, given a stable UID, linked in through the closed edge set, and
> served through `docs_fetch`/`resources/read` - the same path whether the
> caller is a person's browser or an agent's MCP client.
