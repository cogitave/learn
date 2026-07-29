An AI-native organization keeps its whole estate in one canonical model - a
property graph that every product, standard, and agent shares - and then has to
decide how humans and agents actually *reach* it. The transferable answer this
module teaches: expose that model **natively over the Model Context Protocol
(MCP)**, so a person's UI and an agent call the same tools, against the same
schema, and get the same answer. Cogitave's Core is the worked example; earlier
modules in this path build and query that graph, and this module is about the
surface an agent actually calls to reach it: the **native MCP interface**.

"Native" is a specific claim, not a decoration - and a design decision worth
making deliberately. In Cogitave's estate,
[ADR-0003](../../../../core/docs/decisions/0003-mcp-native.md) records the
decision in plain terms: Core's tools and resources over the Model Context
Protocol are the **canonical** query surface, and REST, GraphQL, and `llms.txt`
are generated conveniences over the identical catalog, graph, and search
materializations - not the other way around. A human's UI and an agent call the
same tool, against the same schema, and get the same answer.

Concretely, in Cogitave's instance, Core embeds an MCP server directly in its
Rust hot path, targeting **spec revision 2025-11-25**, reachable over stdio for
local agents (the namzu kernel, CI) or Streamable HTTP for edge and remote
callers. Every tool's input and output validate against **JSON Schema 2020-12** -
the same dialect the property graph's own schema uses, so a tool's structured
result and the graph model agree by construction rather than by convention.

Everything in this module is grounded in what
[mcp-interface.md](../../../../core/docs/mcp-interface.md) and ADR-0003 actually
state today for that instance. Read this module the way you would read those
documents: as the source of truth, with this module teaching you to use them
rather than paraphrasing them from memory.

## What you will get from this module

By the end, you will be able to reason about a call to a canonical model over
MCP end to end - Cogitave's Core here: why the surface is native rather than
adapted, what protocol guarantees you can rely on - transports, schema dialect,
the error model - which tools and resources exist and what each one returns, and
where the governance tools stop at "propose" instead of "mutate."

## Where this fits

This is the third module of the path that teaches you to build on a single
canonical model. It assumes you can already picture such a model as a property
graph and does not re-teach that model; if a term here is unfamiliar,
[mcp-interface.md](../../../../core/docs/mcp-interface.md) links onward to the
substrate and query docs it builds on.
