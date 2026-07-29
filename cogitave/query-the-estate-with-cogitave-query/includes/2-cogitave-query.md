A query layer over a canonical graph is not a single index with a ranking tweak on top - it runs two independent retrievers in parallel and fuses their output before graph structure ever enters the picture. This unit walks that pipeline stage by stage, using [Cogitave Query](../../../../core/docs/query.md) as the worked example.

## 1. Lexical - BM25 over immutable segments

The lexical retriever is BM25 (Robertson/Zaragoza), the same ranking function Lucene, Elasticsearch, and Tantivy default to, over an inverted index built as **immutable, mergeable segments** with an FST term dictionary. Immutable segments give snapshot reads without locking, and they align with Core's content-addressed publish model: a new content root is just a new, additively-merged segment set, not a rewrite.

## 2. Dense - HNSW vectors

The dense retriever is approximate nearest-neighbor search over per-node embeddings using **HNSW** - a multi-layer proximity graph with logarithmic search complexity, and the de-facto standard in vector search. The vector index lives in the *same Rust process* as the inverted index - no network hop - keyed by the same node `uid` the lexical index uses, so both retrievers are talking about the same node.

## 3. Optional - learned sparse and late interaction

For high-value corpora, the design keeps a spec-level option for **learned sparse** expansion (SPLADE) and **late-interaction** reranking (ColBERTv2, with SPLATE for CPU-friendly candidate generation), sitting behind the same fusion interface as the other two retrievers. These are explicitly not a Day 0 dependency - an upgrade path, not something you should assume is live.

## 4. Fusion - Reciprocal Rank Fusion

The two (or three) ranked lists are fused with **Reciprocal Rank Fusion**: `score(d) = Σ_r 1 / (k + rank_r(d))`, with `k = 60` by default. RRF fuses on *rank position*, not raw score - which matters because BM25's score is unbounded while cosine similarity is bounded to `[-1,1]`, and reconciling those two scales is an unsolved problem. Fusing on rank sidesteps it entirely, and it means retrievers can be added or removed without recalibrating anything else in the pipeline.

## Same pipeline, every surface

The fused, graph-reranked result (graph rerank is the next unit) backs every surface identically: the MCP tools `docs_search`, `code_sample_search`, `get_related`, `get_learning_path`, `resolve_xref`, and `query_graph` on the agent side, and GraphQL/REST plus a JSON content API on the human/programmatic side. There is one ranking, read from one place.

## The bounded profile: `query_graph`

`query_graph` is how an agent reaches the property graph directly, shaped as a GQL/openCypher-style `MATCH … RETURN` - but only a narrow, **read-only, resource-bounded** subset of it, never the full language. A graph-query tool is exactly the kind of arbitrary-code-execution surface the MCP security model says to treat with caution, so every bound below is enforced server side, not left as advisory guidance:

| Bound | Rule |
|---|---|
| Read-only | No `CREATE`, `MERGE`, `SET`, `DELETE`, `REMOVE`, `INSERT`, procedure `CALL{…}`, or schema ops - only `MATCH`/`OPTIONAL MATCH … WHERE … RETURN` with `ORDER BY`/`SKIP`/`LIMIT`. |
| Allowlisted labels | Relationship types must be in the closed **9**-edge vocabulary (`partOf, dependsOn, xref, appliesTo, forRole, teachesSkill, supersededBy, implementedBy, derivedFrom`); an unknown label rejects the query. |
| Max traversal depth | Variable-length patterns are capped at `d ≤ 4`; an unbounded `*` is rejected and must be written `*1..d`. |
| Max result rows | `limit` defaults to 100, capped at 1000; an over-cap response is truncated with `truncated: true`. |
| Timeout | A ~250 ms wall-clock budget; exceeding it aborts the query. |
| Parameterized only | `params` bind by name and are never string-spliced into the pattern - the pattern cannot be widened at call time. |

A violation is returned as a **tool execution error** (`isError: true`), not a protocol error, so the calling model can read why and self-correct instead of the connection failing outright. The same bounded traversal underlies graph faceting and `get_related`, too - there is exactly one enforced path into the graph, not a second, unbounded one.
