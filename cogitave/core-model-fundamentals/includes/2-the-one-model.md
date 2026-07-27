The [Cogitave Core Architecture](../../../../core/docs/architecture.md) doc
states the thesis in one line: Cogitave Core is a single **typed property
graph** (a labeled property graph, LPG) with one identity rule and one change
rule, materialized into three read shapes and served behind one query layer
that is MCP-native. Everything else in this unit is what that sentence cashes
out to.

## Nodes, edges, and one flat namespace

The graph has **18 node types** - `Org`, `Repo`, `Product`, `Service`, `Doc`,
`Unit`, `Module`, `LearningPath`, `ADR`, `Agent`, `Skill`, `Standard`,
`InfraResource`, `Decision`, `Team`, `Person`, and more - and a **closed set of
11 edge types**, among them `partOf` (composition), `dependsOn`,
`xref`, `appliesTo`, `teachesSkill`, and `derivedFrom`. The set is closed
deliberately: a fixed vocabulary is what keeps traversal queries, faceting, and
certification evidence stable over time. You are reading one instance of this
graph right now - this `Unit` is `partOf` this `Module`, exactly as the schema
describes.

## Two identifiers, two jobs

The graph separates identity from version:

- **`uid`** is immutable identity - a dotted name (`cogitave.<area>.<name>`)
  that is globally unique across the entire multi-org estate. There is one
  flat namespace; a UID names exactly one node everywhere, so an edge or an
  `@uid` reference resolves the same way regardless of which org issued it.
  The URL may change; the UID never does.
- **`contentHash`** is a content-addressed digest of the canonicalized node
  payload. Two materializations with the same hash are byte-identical and
  stored once - the same Merkle-DAG discipline Git and IPFS use for their own
  object models.

Identity also carries **no PII**: a `Person` node holds only a non-PII handle
and coarse role labels, with any personal data held in a separate,
access-controlled store keyed by the same UID.

## Three materializations, one source of truth

The graph is the source of truth; reads are served from three derived,
rebuildable indexes - a **catalog** (UID-keyed flat records), a **graph
store** (typed adjacency for traversal), and a **search index** (lexical +
vector). All three are pure functions of the graph at a given content root,
so any of them can be rebuilt independently without touching the source.

## Why this is "one model," not three

Because the estate itself - orgs, teams, services, infra, standards, controls,
observability signals - is *nodes and edges in this same graph*, "if code
changes, docs are mandatory" generalizes into a graph-level invariant rather
than a CI afterthought: a `Repo` node changing without a connected `Doc` or
`Decision` node is something the graph itself can flag, not just a check
bolted on top of it.
