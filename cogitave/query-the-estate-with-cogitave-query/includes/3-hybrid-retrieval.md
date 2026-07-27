The previous unit walked the pipeline. This one is about the decision behind it - recorded as [ADR-0002](../../../../core/docs/decisions/0002-hybrid-retrieval.md) - and what the graph-aware rerank adds once lexical and dense are already fused.

## The decision: why not just pick one retriever

The problem ADR-0002 states plainly: technical and agent queries mix natural-language intent with exact tokens, and Core additionally holds a graph neither text index can see. Four options were weighed:

1. Dense-only (a single embedding model + ANN).
2. Lexical-only (BM25).
3. **Hybrid: BM25 + dense, fused by Reciprocal Rank Fusion, then graph rerank - the option chosen.**
4. Hybrid with *learned linear score fusion* - a weighted sum of normalized scores.

Option 3 won on evidence, not intuition: on the WANDS benchmark, RRF scores 0.7068 NDCG against BM25's 0.6983 and kNN's 0.6953 - hybrid beats either retriever alone. Option 4, weighted linear fusion, was rejected as **brittle**: it needs per-corpus score normalization and tuning, and it re-breaks every time a retriever changes underneath it - exactly the recalibration problem rank-based fusion was chosen to avoid.

The ADR is honest about the trade this buys: fusing three signals means three signals to evaluate, mitigated by logging every one per query into the eval harness rather than guessing at ranking changes. In exchange, the system **degrades gracefully** - if the vector index is cold, lexical retrieval still answers on its own.

## The graph-aware rerank

Once BM25 and dense are fused into one candidate set by RRF, that set is reranked using the one signal the text indexes never saw: the graph itself. Cogitave Query computes a structural prior with **Personalized PageRank**, seeded on the query's anchor nodes - its products, its skills, the document the caller is currently on - the standard graph-rerank technique in GraphRAG-style systems. Edge `weight` and edge `type` modulate how that prior propagates: a `dependsOn` prerequisite edge propagates differently from a plain `xref`. The final order combines the RRF score with this graph prior and the ranking signals below.

## Ranking signals read off the graph itself

| Signal | Source | Effect |
|---|---|---|
| Moniker freshness | `monikerRange` vs. requested version; `lastModified` | Prefer the node valid for the requested product version; decay stale ones. |
| Audience / region | `audience`, `forRole` edges, `region`, `locale` | Boost matches for the caller's role and locale. |
| Prerequisite proximity | `dependsOn` distance over the Skill graph from what the learner already knows | Rank "next learnable" units above ones gated by unmet prerequisites. |
| Level fit | `level` vs. caller profile | Match beginner content to beginners, expert to experts. |
| Authority | Personalized-PageRank centrality; `supersededBy` | Prefer canonical nodes; demote superseded ones. |

These apply as multiplicative boosts on the reranked score, and every one is logged per query for the eval harness - ranking changes are measured, never guessed at.

## Facets are traversals, not a second index

Because `type`, `products`, `topics`, `audience`, `level`, and `monikerRange` are first-class node properties, and `partOf`/`appliesTo`/`forRole` are edges, a facet like "reference docs for product yuva, role platform, version >=2.0" is just a typed-edge-constrained filter applied before rerank - not a separate taxonomy system to keep in sync. The facet UI and an agent's `query_graph` call share that one traversal, so counts never drift between them.
