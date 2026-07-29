## Why native, not adapted

When an org decides how to serve its canonical model to humans and agents, it is
really choosing among three shapes of query surface. Cogitave weighed exactly
these in [ADR-0003](../../../../core/docs/decisions/0003-mcp-native.md): (1)
**MCP-native** - tools and resources are the canonical surface, REST/GraphQL/`llms.txt`
are generated; (2) REST/GraphQL-native with an MCP adapter bolted on; (3) a
proprietary agent RPC. Cogitave is an agent company, and agents are the primary
consumers of company knowledge, so option 2 would make them second-class - "the
opposite of the company thesis," in the ADR's own words - and option 3 forfeits
ecosystem and standardization for no real gain. The stated decision drivers
were: an agent-first AI maturity target (Level 4 - agent-first with human
oversight), one model and one query so humans and agents cannot drift onto
different data, standardized tool/resource semantics with subscriptions and
change notifications, and a spec Cogitave can author against with a clear upgrade
path. The chosen outcome is option 1. The transferable point is the question,
not Cogitave's particular answer: if agents are first-class consumers of your
knowledge, an adapter in front of a human-first API quietly makes them
second-class.

## The protocol baseline

[mcp-interface.md §1](../../../../core/docs/mcp-interface.md#1-protocol-baseline)
pins the concrete contract Cogitave's Core server commits to - and it doubles as
a checklist of the decisions any native MCP surface has to make:

- **Spec revision 2025-11-25** - the `2026-07-28` release candidate is tracked
  for a future upgrade, not adopted yet.
- **Two transports**: stdio for local agents (namzu kernel, CI) and Streamable
  HTTP for edge/remote callers - no legacy HTTP+SSE. An invalid `Origin` gets
  HTTP 403; GET-stream polling and resumption use event IDs.
- **JSON-RPC 2.0** over a stateful session, with capability negotiation
  happening once, at `initialize`.
- **JSON Schema 2020-12** for every tool's input and output - the same dialect
  the property graph schema itself uses, so a tool's structured content and the
  model validate identically.
- **Capabilities advertised**: `tools` (with `listChanged`), `resources`
  (`subscribe` + `listChanged`), `logging`, `completions`, plus tool/resource
  icons exposed as metadata.
- **Errors as data, not protocol failures**: a tool input-validation failure
  comes back as a **tool execution error** (`isError: true`) rather than a
  JSON-RPC protocol error - SEP-1303 - so the calling model can read the
  failure and self-correct instead of the call simply breaking.

## What this buys, and what it costs

Per the ADR's own consequences: subscriptions give live invalidation instead of
polling, agents and humans literally cannot drift onto different data, and the
design aligns with the
[ai-agent-engineering standard](../../../../standards/docs/standards/ai-agent-engineering.md)'s
requirement that every capability go over MCP with a repo-committed
`.mcp.json`. The ADR is equally honest about the risks: MCP itself is
fast-moving - hence pinning a revision instead of floating on it - and a tool
surface is an attack surface, which is why the graph-query tool covered in the
next unit is deliberately read-only and bounded rather than a general query
escape hatch.

> [!TIP]
> When you evaluate any MCP surface, ask ADR-0003's own question back: is this
> tool/resource set the canonical thing itself, or an adapter in front of
> something else? Cogitave's answer for Core is the former.
