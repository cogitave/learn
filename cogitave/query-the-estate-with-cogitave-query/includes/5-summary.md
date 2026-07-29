You now know how a query layer resolves a request against one canonical graph - with Cogitave Query as the worked example.

In this module, you:

- Named the **three signals** Cogitave Query fuses - lexical (BM25 over immutable segments), dense (HNSW over per-node embeddings), and graph structure - and why none of them alone is enough for technical or agent queries.
- Traced the **fusion step**: Reciprocal Rank Fusion, chosen over a weighted linear blend of scores because rank-based fusion sidesteps reconciling BM25's unbounded scores with cosine's bounded range, and lets retrievers change without recalibration.
- Saw what the **graph-aware rerank** adds once lexical and dense are already fused - a Personalized PageRank structural prior, plus ranking signals for moniker freshness, audience, prerequisite proximity, level fit, and authority - and that facets are graph traversals, not a second taxonomy to maintain.
- Read the **bounded `query_graph` contract** that lets an agent pattern-match the graph directly: read-only, allowlisted to the 9 edge labels, depth- and row-capped, timed out, and parameterized only - a hard, server-enforced contract rather than advisory guidance.

## Next steps

- @cogitave.learn.native-mcp-interface - the next module in this path, which takes the surfaces this one only named - the native MCP tools and `cogitave://` resources - and teaches the interface itself.
- The **Cogitave Query** doc, in the estate's core repository, is worth a reread directly; this module followed its section order.
- **ADR-0002 - Hybrid retrieval** is the decision record behind the fusion choice, with the options that were rejected and why.
