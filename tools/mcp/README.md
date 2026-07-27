# MCP server - learn.cogitave.com

Serves the published corpus over the Model Context Protocol, so an agent queries
exactly what a person reads.

It does **not** parse the content set. It reads the `_api/` projection the build
already emitted, which means the MCP surface and the website are generated from
one pass over one graph and cannot disagree. Run the build first.

```bash
npm run build            # emits _site/, including _site/_api/
npm run --silent mcp     # stdio - local agents, CI, the namzu kernel
npm run mcp:http         # Streamable HTTP on 127.0.0.1:8787
```

> [!IMPORTANT]
> On stdio, **stdout is the protocol.** `npm run` prints a `> mcp` banner to
> stdout, which corrupts the JSON-RPC stream, so a programmatic client must
> either pass `--silent` or - better - invoke `node` directly, as the client
> configuration below does. The HTTP transport is unaffected.

## What is implemented

Spec revision **2025-11-25**. The authority for this surface is
[`cogitave/core/docs/mcp-interface.md`](../../../core/docs/mcp-interface.md);
what follows is the honest delta.

| Contract | Here |
|---|---|
| Transports: stdio + Streamable HTTP | **Both.** No legacy HTTP+SSE. |
| `403` on invalid `Origin` | **Yes** - the DNS-rebinding defence for a locally bound server. |
| GET stream, resumption, event IDs | **No.** Nothing here pushes, so there is no stream to open; `GET` returns `405`. |
| Tools declare `inputSchema` + `outputSchema`, return structured content | **Yes**, all three tools. |
| Input-validation failures as tool errors (`isError: true`), not protocol errors | **Yes** - so a model can self-correct. |
| Capabilities `tools`, `resources` | **Advertised.** |
| `subscribe`, `listChanged`, `logging`, `completions` | **Not advertised**, because they are not implemented. This server reads a static build and cannot notice a change; claiming `subscribe` would be a promise a client acts on. |
| Tool/resource icons | Not exposed. |

## Tools

| Tool | Behaviour |
|---|---|
| `docs_search` | Lexical search over title, summary, headings, and authored source, with saturating per-field weights. Filters on `product` and node `types`. Returns UIDs. |
| `docs_fetch` | One node by UID: authored markdown, taxonomy, graph edges (`partOf`, `units`, `modules`), and the quiz as structured data. On an unknown UID it suggests the closest matches instead of failing blind. |
| `code_sample_search` | The named regions of `snippets/` - the code the corpus pulls by reference, so a sample returned here is the sample a reader sees. |

> **Retrieval is lexical, not hybrid.** The contract specifies BM25 plus vectors
> plus a graph rerank. There is no embedding store in this repository, so the
> ranking is term overlap across weighted fields. It works well on a corpus this
> size and it is not what the contract ultimately calls for. Do not describe it
> as semantic search.

## Resources

Every node is readable at `cogitave-docs://learn/{uid}` as `text/markdown`.
`resources/list` enumerates them. The contract's canonical scheme is
`cogitave://{type}/{id}`; this server namespaces under `cogitave-docs://learn/`
to match the engine architecture's docs scheme, and the two should be reconciled
before a second server exposes the same UIDs.

## Wiring it into a client

`.mcp.json`, stdio:

```json
{
  "mcpServers": {
    "cogitave-learn": {
      "command": "node",
      "args": ["cogitave/learn/tools/mcp/server.mjs"]
    }
  }
}
```

## What this is not

A hosted endpoint. `https://learn.cogitave.com/mcp` does not exist and cannot be
a static file - MCP is a live JSON-RPC service. This server is the thing you
would deploy behind that path; deploying it is a human, gated step.
