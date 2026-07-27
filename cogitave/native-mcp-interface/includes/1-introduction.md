Cogitave Core is one canonical model of the whole estate: a property graph that
every product, standard, and agent shares. Earlier modules in this path build
and query that graph. This module is about the surface an agent actually calls
to reach it: the **native MCP interface**.

"Native" is a specific claim, not a decoration. [ADR-0003](../../../../core/docs/decisions/0003-mcp-native.md)
records the decision in plain terms: Core's tools and resources over the Model
Context Protocol are the **canonical** query surface, and REST, GraphQL, and
`llms.txt` are generated conveniences over the identical catalog, graph, and
search materializations - not the other way around. A human's UI and an agent
call the same tool, against the same schema, and get the same answer.

Concretely, Core embeds an MCP server directly in its Rust hot path, targeting
**spec revision 2025-11-25**, reachable over stdio for local agents (the namzu
kernel, CI) or Streamable HTTP for edge and remote callers. Every tool's input
and output validate against **JSON Schema 2020-12** - the same dialect the
property graph's own schema uses, so a tool's structured result and the graph
model agree by construction rather than by convention.

Everything in this module is grounded in what
[mcp-interface.md](../../../../core/docs/mcp-interface.md) and ADR-0003 actually
state today. Read this module the way you would read those documents: as the
source of truth, with this module teaching you to use them rather than
paraphrasing them from memory.

## What you will get from this module

By the end, you will be able to reason about a call to Core over MCP end to
end: why the surface is native rather than adapted, what protocol guarantees
you can rely on - transports, schema dialect, the error model - which tools and
resources exist and what each one returns, and where the governance tools stop
at "propose" instead of "mutate."

## Where this fits

This is module 3 of *Build on Cogitave Core*. It assumes you can already picture
Core as a property graph and does not re-teach that model; if a term here is
unfamiliar, [mcp-interface.md](../../../../core/docs/mcp-interface.md) links
onward to the substrate and query docs it builds on.
