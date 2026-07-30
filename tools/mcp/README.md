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

Prefers spec revision **2026-07-28** (the **stateless** protocol) and also accepts
the current handshake-based **2025-11-25**, so a shipping client connects today
while the endpoint stays correct for 2026-07-28 ones. The strict 2026-07-28 rules
below (`server/discover`, per-request `_meta`, header mirroring) apply **only** to
a request that declares that version; a legacy 2025-11-25 client is served through
the `initialize` handshake with none of them. The authority for this surface is
[`cogitave/core/docs/mcp-interface.md`](../../../core/docs/mcp-interface.md); what
follows is the honest delta.

| Contract | Here |
|---|---|
| Stateless for 2026-07-28: no `initialize` handshake | **Yes.** A 2026-07-28 request carries its version in `_meta` (`io.modelcontextprotocol/protocolVersion`) and is served directly. A legacy client still opens with `initialize` (below). |
| Required per-request `_meta` (`protocolVersion`, `clientCapabilities`) | **Enforced for a 2026-07-28 request.** One that declares 2026-07-28 but omits `clientCapabilities` is malformed - `-32602` and HTTP `400`. A legacy request is exempt; it negotiated at `initialize`. |
| `server/discover` (MUST) | **Yes** - returns `protocolVersions` (`["2026-07-28", "2025-11-25"]`), capabilities, and `serverInfo` in one request; answers even under the kill-switch. |
| `UnsupportedProtocolVersionError` shape | **Schema-exact**: `data.supported` + `data.requested`. A client retries from `supported`, so the field name is load-bearing, not cosmetic. |
| Header/body agreement (`MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`) | **Enforced on both HTTP transports** - a mismatch or a missing required header is `-32020` and HTTP `400`, including base64-sentinel (`=?base64?…?=`) decoding before comparison. See the interop note below. |
| HTTP status binding | **Yes** - `400` for header, version, and malformed-`_meta` failures; `404` for an unknown method; `405` for `GET`/`DELETE`; `202` for an accepted notification. A modern server that answered everything `200` would read as a broken one. |
| One JSON-RPC message per POST | **Enforced.** A batch is refused with `-32600`; the transport does not permit it, and a batch has no single method or name to mirror into headers. |
| `initialize` from a legacy client | **Served** - a 2025-11-25 handshake: echoes a version it serves, advertises `tools`/`resources` capabilities, and identifies the server, so a shipping client connects. Plain result, no 2026-07-28 `resultType` wrapper. |
| `resultType` on every result; `serverInfo` in each result's `_meta` | **Yes** - always `"complete"` (this server issues no server-initiated requests, so `"input_required"` never occurs). |
| `CacheableResult` (`ttlMs`, `cacheScope`) on `tools/list` / `resources/list` / `resources/read` | **Yes** - the corpus is a static build, so lists are publicly cacheable. |
| Transports: stdio + Streamable HTTP | **Both.** No legacy HTTP+SSE, no sessions (`Mcp-Session-Id` removed). |
| `403` on invalid `Origin` | **Yes** - the DNS-rebinding defence for a locally bound server. |
| GET stream, `subscriptions/listen`, resumption | **No.** Nothing here pushes, so there is no stream to open; `GET` returns `405`. |
| Tools declare `inputSchema` + `outputSchema`, return structured content | **Yes**, every tool; deterministic `tools/list` order for client caching. |
| Input-validation failures as tool errors (`isError: true`), not protocol errors | **Yes** - so a model can self-correct. |
| `ping` | **Yes** - an empty result, so a legacy client's keepalive is answered. |
| `logging`, Roots, Sampling | **Not implemented** (removed or deprecated in 2026-07-28). |
| Tool/resource icons | Not exposed. |

### Interop note: two revisions, one endpoint

A request that **declares 2026-07-28** (in `_meta` and the mirrored
`MCP-Protocol-Version` header) is held to the full 2026-07-28 transport:
`Mcp-Method`, and for `tools/call` / `resources/read` `Mcp-Name`, are REQUIRED,
and a mismatch or a missing required header is `-32020` and HTTP `400`. The
mismatch rule is a real security property - an intermediary routes on the header
while the server executes the body, so the two being allowed to disagree is the
vulnerability, and it is never relaxed for a 2026-07-28 request.

A request that does **not** declare 2026-07-28 is a legacy **2025-11-25** client:
it opens with `initialize`, sends no per-request `_meta`, and mirrors no headers -
and it is served without any of the above. That back-compat is what lets a
shipping client (which does not yet speak 2026-07-28) connect today. The strict
rules are not weakened; they simply do not apply to a legacy request, because a
legacy request cannot carry the headers whose agreement they check.

Conformance is pinned by [`conformance.test.mjs`](conformance.test.mjs)
(`npm test`), which asserts the MUST/SHOULD rules by name and runs in CI.

## Tools

| Tool | Behaviour |
|---|---|
| `docs_search` | Lexical search over title, summary, headings, and authored source, with saturating per-field weights. Filters on `product` and node `types`. Returns UIDs. |
| `docs_fetch` | One node by UID: authored markdown, taxonomy, graph edges (`partOf`, `units`, `modules`), and the quiz as structured data. On an unknown UID it suggests the closest matches instead of failing blind. |
| `code_sample_search` | The named regions of `snippets/` - the code the corpus pulls by reference, so a sample returned here is the sample a reader sees. |
| `list_catalogue` | Enumerate the corpus so a tools-only client can browse without a query. Optional `kind` / `product` filter. |
| `get_related` | Given a UID, the shared-taxonomy neighbours - the same scorer that renders the on-page "Related" section, so a reader and an agent get the same result. Excludes the node, its parent, and its children. |
| `resolve_xref` | Resolve a UID to its node's kind, title, and locations (`uri` + `url`) without fetching the whole node - the lightweight step for following an `@uid` reference. |
| `get_learning_path` | Given a module, unit, or path UID, the ordered learning path(s) that reach it - the module sequence and where the target sits - so an agent (or a person) can plan how to acquire a competency. Finds every path a shared module belongs to. |

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

## The hosted endpoint

`https://learn.cogitave.com/mcp` is live: the same corpus is served over MCP by
the Cloudflare Pages Function in `functions/mcp.js`, deployed alongside the site
by `.github/workflows/deploy.yaml`. It speaks the 2026-07-28 stateless revision
and enforces that revision's per-request header mirroring, so a client still on
an older revision - or one that does not mirror the method and name headers - is
refused with a message that says so, rather than served wrong data.
