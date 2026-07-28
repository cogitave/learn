You now know Core's native MCP interface well enough to reason about a call to
it, not just recite that one exists.

In this module, you:

- Learned why MCP is Core's **canonical** query surface rather than an adapter:
  ADR-0003 chose tools/resources over MCP as the source of truth, with REST,
  GraphQL, and `llms.txt` generated from the identical catalog, graph, and
  search materializations, so humans and agents cannot drift onto different
  data.
- Pinned the **protocol baseline**: spec revision 2025-11-25, stdio and
  Streamable HTTP transports, JSON-RPC 2.0 over a stateful session, JSON Schema
  2020-12 for every tool's input and output, and tool input-validation failures
  returned as tool execution errors so a calling model can self-correct.
- Named Core's **tools and resources** - `docs_search` through
  `describe_schema`, the `cogitave://{type}/{id}` resource template with
  `subscribe` and change notifications - and saw how `query_graph` is bounded
  (read-only, allowlisted labels, capped depth, capped rows) so it cannot become
  a general escape hatch.
- Distinguished the **open reads** from the **propose-only writes**:
  `request_intake` and `advance_stage` stage a draft node and open a GitHub
  issue/PR, and never mutate protected state directly.

## Next steps

- The **mcp-interface.md** doc, in the estate's core repository, is worth a
  re-read with this module's context - it is short, and now every section
  should be legible on its own.
- **ADR-0003** is the estate's decision record itself; revisit it if you
  want the full trade-off behind "native."
- @cogitave.learn.paths.build-on-core - this module is part 3 of 4 in *Build on
  Cogitave Core*; the path also covers the property-graph model itself, Cogitave
  Query, and how products project their state into Core.
