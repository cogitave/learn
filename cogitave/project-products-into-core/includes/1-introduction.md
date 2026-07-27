In the first three modules of this path you learned Core's node and edge model,
how to query it, and how to reach it over MCP. This module closes the loop on a
different question: where does the *content* come from? A product spec, an
engineering standard, an ADR, or the module you are reading right now - how does
it end up as a node you can query, rather than a file that quietly drifts from
whatever else says the same thing?

## One graph, not a pile of silos

[Cogitave Core's architecture](../../../../core/docs/architecture.md) states the
thesis directly: docs, the internal developer portal, governance, compliance
evidence, and infra are **projections of one graph** - never separate stores. A
`Doc`, a `Standard`, an `ADR`, and this very learning `Unit` are all typed nodes
in the same property graph, addressed the same way, queried through the same
MCP tools a human's UI calls. There is no second copy for "the docs system" and
a third for "the learn platform."

That only works if content actually gets **into** the graph, and a fact true in
one place cannot silently go stale in another. This module covers both halves:
how a document becomes a node (unit 2), and how Cogitave keeps one authoritative
owner per load-bearing fact so the rest of the estate cites it instead of
re-typing it and drifting (unit 3).

> [!IMPORTANT]
> Cogitave Core is a **specification and architecture today**, not a running
> product. No Core server is live yet. The mechanics in this module - the
> pipeline, the UID/contentHash scheme, the fact registry - are the design the
> estate is building toward, and parts of it (the fact-drift scanner) already
> run today as plain checks over files, ahead of any live graph.

## What you will get from this module

The ability to explain, concretely, how a document becomes a queryable node,
and why "the estate is a second brain" is more than a slogan: it names a real
gap - facts restated in prose instead of linked - and a real, checkable fix.
This is the last module of **Build on Cogitave Core**; finishing it earns the
path's trophy.
