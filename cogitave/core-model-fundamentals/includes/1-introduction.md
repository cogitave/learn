Ask five different systems where a piece of company knowledge lives - the docs
site, the internal developer portal, the compliance evidence store, the infra
inventory, an agent's retrieval index - and a normal company gives you five
different answers, in five different stores, that drift from each other the
moment two of them are updated separately.

An AI-native organization refuses that split. It runs on a **single typed
property graph** that all of those surfaces are *projections* of - not synced
copies, not separate stores that happen to agree today. Docs, the internal
developer portal, governance and compliance evidence, infrastructure inventory,
and agent knowledge all read from the same graph, through the same query layer,
and that layer is MCP-native: a human using the API/UI and an agent using MCP
get *the same knowledge from the same model*. **Cogitave's Core** is one such
graph - the worked example this module builds on. Its canonical
[architecture doc](../../../../core/docs/architecture.md) states the same thesis
for that instance, and this module - and the rest of this path - builds directly
on it.

## What this module teaches

Two ideas make the one-graph claim more than a slogan:

- **The one-model thesis** - why one graph, not one store per domain, and what
  that buys in exchange for the discipline it demands.
- **The property-graph substrate** - why that one graph is specifically a
  *labeled property graph*, what a design decision like
  [Cogitave's ADR-0001](../../../../core/docs/decisions/0001-property-graph-as-substrate.md)
  accepted and rejected to get there, and what makes it fast enough to serve.

## Status: read this before you build against it

Cogitave's architecture doc opens by calling itself a "Day 0 canonical spec."
Treat it that way here, too. A one-graph model and the decision behind it are
things you **decide** - accept, not merely propose - and this module teaches
Cogitave's as documented decisions. It is not a claim that every product has
finished projecting into the graph, and it is not a hands-on module: you will
not stand up a canonical model here, you will learn to read the spec that
governs one, the same spec an auditor or a querying agent relies on.
