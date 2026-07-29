The thesis in one line: an AI-native organization runs on **one** typed property
graph - a labeled property graph (LPG) - with a single identity rule and a
single change rule, materialized into a few derived read shapes and served
behind one query layer that is MCP-native. Cogitave's own Core is one such
graph; this unit uses it as the worked example, and
[its architecture doc](../../../../core/docs/architecture.md) states the same
thesis for that instance. Everything below is what the one-line thesis cashes
out to - and what you would decide when you model your own estate this way.

## Nodes, edges, and one flat namespace

A canonical model needs a **closed, typed vocabulary**: a fixed set of node
types and a fixed set of edge types. A closed set is what keeps traversal
queries, faceting, and certification evidence stable as the org grows - new
content is new *nodes*, not new *schemas*. Cogitave's Core, for instance, has
**18 node types** - `Org`, `Repo`, `Product`, `Service`, `Doc`, `Unit`,
`Module`, `LearningPath`, `ADR`, `Agent`, `Skill`, `Standard`, `InfraResource`,
`Decision`, `Team`, `Person`, and more - and a closed set of **11 edge types**,
among them `partOf` (composition), `dependsOn`, `xref`, `appliesTo`,
`teachesSkill`, and `derivedFrom`. You are reading one node of that graph right
now: this `Unit` is `partOf` this `Module`, exactly as the schema describes.

## Two identifiers, two jobs

Separate **identity** from **version**:

- An immutable **`uid`** - a dotted name (`<org>.<area>.<name>`) that is globally
  unique across the whole multi-org estate. One flat namespace means a UID names
  exactly one node everywhere, so an edge or an `@uid` reference resolves the
  same way regardless of which org issued it. The URL may change; the UID never
  does. (Cogitave's own UIDs read `cogitave.<area>.<name>`.)
- A content-addressed **`contentHash`** - a digest of the canonicalized node
  payload. Two materializations with the same hash are byte-identical and stored
  once: the same Merkle-DAG discipline Git and IPFS use for their object models.

Identity carries **no PII**: a `Person` node holds only a non-PII handle and
coarse role labels, with any personal data in a separate, access-controlled
store keyed by the same UID.

## Derived reads, one source of truth

The graph is the source of truth; reads are served from derived, **rebuildable**
indexes - typically a **catalog** (UID-keyed flat records), a **graph store**
(typed adjacency for traversal), and a **search index** (lexical + vector). Each
is a pure function of the graph at a given content root, so any of them can be
rebuilt independently without touching the source.

## Why this is "one model," not three

Because the estate itself - orgs, teams, services, infra, standards, controls,
observability signals - is *nodes and edges in this same graph*, a rule like "if
code changes, docs are mandatory" becomes a **graph-level invariant** rather than
a CI afterthought: a `Repo` node changing without a connected `Doc` or `Decision`
node is something the graph itself can flag, not just a check bolted on top of
it. That is the payoff of modeling a whole organization as one graph - and the
reason to reach for a single canonical model before you have five disconnected
stores to reconcile.
