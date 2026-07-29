An AI-native org runs on one canonical model: a single typed property graph shared by every product, standard, and agent in the estate (@cogitave.learn.core-model-fundamentals covers that graph directly). Holding the graph is only half the story - you also need one way to *ask* it something. That layer is the **query interface** over the model, and **Cogitave Query** is the reference implementation this module traces.

> One query layer over the [canonical graph](../../../../core/docs/architecture.md). Same model, same retrieval for humans (API/UI) and agents (MCP). Retrieval is **hybrid**: lexical recall, semantic recall, and graph structure are three signals fused into one ranking - none alone is enough.

That single sentence from [Cogitave Query](../../../../core/docs/query.md) captures the pattern this module teaches. With one query layer, there is no separate "agent view" of the estate and a different "human view" - in Cogitave's estate, `docs_search` over MCP and the human-facing search box call the same pipeline and get the same ranking. This module teaches you to reason about what such a pipeline does to a query, so you can design your own - not to reimplement Cogitave's.

## Why fuse three signals instead of picking the best one

Lexical retrieval (BM25) and dense-vector retrieval each fail on inputs the other handles well: BM25 misses paraphrase and synonymy, dense retrieval misses the rare exact tokens - identifiers, error codes, API symbols, version strings - that dominate technical and agent queries. A query layer built over a canonical graph can add a third signal neither text index can see at all: the **graph** itself, with its prerequisite edges, cross-references, and authority structure. Cogitave Query fuses all three.

## Read this as a Day 0 spec

Cogitave's Core is [a Day 0 design](../../../../core/README.md) - the canonical model, its query layer, and its native MCP surface are specified and built against, not a black box you take on faith. This module follows that same posture: every mechanism it names - BM25 segments, HNSW vectors, Reciprocal Rank Fusion, the bounded `query_graph` profile - is stated exactly as [Cogitave Query](../../../../core/docs/query.md) and [ADR-0002](../../../../core/docs/decisions/0002-hybrid-retrieval.md) specify it, with a link back to the source.

## What you will get from this module

By the end, you will be able to trace a query through the pipeline end to end, explain why rank-based fusion was chosen over a weighted score blend, and read the bounded graph-query contract that lets an agent call the graph directly without an unbounded write path opening underneath it.
