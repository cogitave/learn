You now know a canonical model's native MCP interface - Cogitave's Core here -
well enough to reason about a call to it, not just recite that one exists.

In this module, you:

- Learned why MCP can be a canonical model's **canonical** query surface rather
  than an adapter: Cogitave's ADR-0003 chose tools/resources over MCP as the
  source of truth, with REST, GraphQL, and `llms.txt` generated from the
  identical catalog, graph, and search materializations, so humans and agents
  cannot drift onto different data.
- Pinned the **protocol baseline** such a server commits to: spec revision
  2025-11-25, stdio and Streamable HTTP transports, JSON-RPC 2.0 over a stateful
  session, JSON Schema 2020-12 for every tool's input and output, and tool
  input-validation failures returned as tool execution errors so a calling model
  can self-correct.
- Named the **tools and resources** such a surface exposes - `docs_search`
  through `describe_schema`, the `cogitave://{type}/{id}` resource template with
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
- @cogitave.learn.paths.build-on-core - this module is part 3 of 4 in that path;
  it also covers the property-graph model itself, the query interface (Cogitave
  Query is its reference implementation), and how products project their state
  into the canonical model.
