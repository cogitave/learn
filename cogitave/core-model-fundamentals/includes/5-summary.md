You now have the two ideas the rest of "Build on Cogitave Core" builds on.

In this module, you:

- Named the **one-model thesis**: Cogitave Core is a single typed property
  graph that docs, the internal developer portal, governance, infra, and
  agents all project from - not separate stores that happen to agree today.
- Learned the graph's shape - its **18 node types** and **closed set of 11
  edge types** - and its two orthogonal identifiers: **`uid`** for immutable
  identity and **`contentHash`** for content-addressed version, plus the
  three materializations (catalog, graph store, search index) served from it.
- Read ADR-0001 and can say why a labeled property graph won over relational,
  RDF, and federated alternatives - and why that choice is authored against an
  ISO standard (GQL) as a spec, while the serving engine itself is
  full-scratch.
- Saw the physical substrate: one Rust binary co-locating BM25, HNSW, and the
  graph behind a native MCP server, decoupled from the TypeScript build side
  by a single content-hash contract.

## Next steps

This module is the foundation for the rest of the "Build on Cogitave Core"
path.

- @cogitave.learn.query-the-estate-with-cogitave-query - the next module,
  on how to query the estate with Cogitave Query, followed later by the native
  MCP interface and how individual products project their state into Core.
- The **Cogitave Core Architecture** doc is the full spec, in the estate's
  core repository, now that you have the vocabulary for it.
- The **Cogitave Core — Substrate** doc covers the physical serving path, if
  you want the latency and caching detail in full.
- **ADR-0001** is the decision record itself, including the options this
  module only summarized.
