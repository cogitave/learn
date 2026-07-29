The previous unit took "one typed property graph" as given. This unit is
about why a **labeled property graph** specifically, and what makes that one
graph fast enough to be the read path for every product in your estate.

## The decision: choosing a graph substrate

Any org picking this substrate faces the same problem: docs, an internal
developer portal, governance and compliance evidence, multi-cloud infra
inventory, and agent knowledge all need to be *the same knowledge*, queryable
by humans and agents alike. The default industry shape - one store per domain
(a docs CMS, an IDP catalog, a CMDB, a vector store) - guarantees drift and
duplicated identity. Cogitave records its own answer in
[ADR-0001](../../../../core/docs/decisions/0001-property-graph-as-substrate.md),
which frames the problem plainly and weighs four options:

| Option | Verdict |
| --- | --- |
| Single labeled property graph (LPG) | **Chosen** |
| Relational schema + a separate graph view | Buries the graph actually being traversed |
| RDF / triple store (SPARQL) | Higher-ceremony, weaker property ergonomics for faceting/ranking |
| Document store per domain, federated at query time | Re-introduces the drift the decision exists to eliminate |

In that ADR the LPG wins because it is now an **ISO standard** - GQL, ISO/IEC
39075:2024, the first new ISO query-language standard since SQL in 1987 - with
a mature open lineage in openCypher, and because nodes and edges carrying
properties directly matches faceting and ranking needs without join
gymnastics. Notably, the standard is authored against as a **spec, not a
dependency**: Cogitave's in-process engine is full-scratch, consistent with a
house style that treats off-the-shelf systems as reference rather than
something to depend on. That is Cogitave's stance, not a requirement of the
pattern - you could pick the same LPG model and run it on an off-the-shelf
graph database.

The trade-off is named honestly, and it is inherent to the pattern: a single
model is a single blast radius, mitigated (in Cogitave's case) by
content-addressing and a blocking validation gate; and a closed edge vocabulary
needs governance to evolve, which is deliberate, to keep traversal and evidence
stable.

## The physical substrate: one process, four subsystems

How the graph is actually served is an implementation choice, and Cogitave's
[substrate](../../../../core/docs/substrate.md) doc describes one concrete
answer. One Rust binary co-locates four subsystems in a single address space,
so a query never crosses a network boundary mid-flight: a **lexical** engine
(BM25 over immutable, mergeable segments), a **vector** engine (in-process HNSW
ANN), the **property graph** itself (typed adjacency plus Personalized-PageRank
rerank), and the **MCP server** - stdio for local/CI, Streamable HTTP for the
edge - embedded directly as the query layer, not a process sitting in front of
it.

Build and serve are deliberately decoupled: authoring, parsing, enrichment,
embedding, and index emission run in the TypeScript (namzu) pipeline, which is
allowed to be heavy because it is off the hot path; it hands the Rust serving
process three immutable materializations behind a new content root. The only
contract between them is the content hash.

## Why co-locate, and why Cogitave goes full-scratch

Co-locating lexical, vector, and graph retrieval behind one query layer, with
one snapshot model and one cache key, is a property no assembled stack of
separate services gives you - the "one model, one query layer" thesis restated
as an engineering consequence rather than an aspiration. That payoff is the
transferable lesson. Cogitave then takes it to the limit: Tantivy-class BM25,
HNSW libraries, and vector databases are cited as **reference implementations**,
not dependencies, and the engine is built full-scratch for vertical
integration. That last step is one org's answer for maximum sovereignty, not
something the pattern forces on you.
