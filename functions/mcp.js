/**
 * learn.cogitave.com/mcp - Cloudflare Pages Function.
 *
 * A Pages Function ships INSIDE the same upload as `_site/`, so the MCP surface
 * and the pages it describes are one artifact and one version. There is nothing
 * to keep in sync: a deploy moves both or neither.
 *
 * The protocol lives in ../tools/mcp/protocol.mjs, which imports nothing
 * runtime-specific and is the same module the Node server uses. This file only
 * answers the three questions that are environment-specific: where the corpus
 * comes from, how a request arrives, and how the kill-switch is resolved.
 *
 * Not the gateway. `docs/deployment.md` section 5 describes a metered,
 * authenticated MCP behind the cogitave-cloud edge (tenants, entitlements, the
 * free-tier fence). That is a different surface on a different hostname and it
 * does not exist yet. This endpoint is unauthenticated and unmetered by design:
 * it serves a public documentation corpus that is already public as HTML.
 */

import { handleBody, rpcError } from '../tools/mcp/protocol.mjs'

/** Cold-start cache. A warm isolate answers without re-fetching the corpus. */
let cached = null
let inflight = null

/**
 * Load once per isolate. Concurrent cold requests share one load rather than
 * each fetching the corpus - without this, a burst against a fresh isolate
 * multiplies the fetch by the number of simultaneous requests.
 */
async function getState(env, request) {
  if (cached) return cached
  if (inflight) return inflight

  inflight = (async () => {
    const base = new URL(request.url).origin
    const get = async (path) => {
      // ASSETS is the Pages static binding; the origin fetch is the fallback so
      // the same code runs under `wrangler dev` and in tests.
      const res = env?.ASSETS ? await env.ASSETS.fetch(new URL(path, base)) : await fetch(base + path)
      if (!res.ok) throw new Error(`cannot load ${path}: ${res.status}`)
      return res.json()
    }

    // Two subrequests, whatever the corpus grows to. Fetching the per-node files
    // instead would be one subrequest each, and platforms cap subrequests per
    // invocation - so that shape breaks exactly when traffic is highest.
    const [nodes, samples] = await Promise.all([get('/_api/corpus.json'), get('/_api/code-samples.json')])

    cached = { corpus: new Map(nodes.map((n) => [n.uid, n])), samples }
    inflight = null
    return cached
  })()

  return inflight
}

const MAX_BODY = 1_000_000
const ALLOWED_ORIGINS = new Set(['https://learn.cogitave.com', 'https://docs.cogitave.com'])

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      // A request here is a JSON-RPC call. A cached POST response would answer
      // the wrong call.
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })

export async function onRequest({ request, env }) {
  // agentic-operations.md section 6: independently disable-able in one action.
  // At the edge that action is a Pages environment variable - no redeploy of the
  // site, no code change. The handshake is refused too, because unlike the local
  // server there is no operator watching a probe.
  if (env?.COGITAVE_LEARN_MCP_ENABLED === 'false') {
    return json(rpcError(null, -32001, 'learn MCP is disabled (kill-switch active).'), 503)
  }

  // Origin validation is the DNS-rebinding defence in the transport spec. A
  // request with no Origin is a program, not a browser, and is allowed.
  const origin = request.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response('forbidden origin', { status: 403 })
  }

  if (request.method !== 'POST') {
    // Nothing here pushes, so there is no server-initiated stream to open.
    return new Response('POST only', { status: 405, headers: { allow: 'POST' } })
  }

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) {
    return json(rpcError(null, -32600, 'Request body too large.'), 413)
  }

  let text
  try {
    text = await request.text()
  } catch {
    return json(rpcError(null, -32700, 'Could not read request body.'), 400)
  }
  if (text.length > MAX_BODY) {
    return json(rpcError(null, -32600, 'Request body too large.'), 413)
  }

  let state
  try {
    state = await getState(env, request)
  } catch (e) {
    // Fail loudly rather than answering from an empty corpus: an MCP client
    // cannot tell "no results" from "no data", and would trust the silence.
    return json(rpcError(null, -32603, `Corpus unavailable: ${e.message}`), 503)
  }

  const reply = handleBody({ ...state, disabled: () => false }, text)
  return reply ? json(reply) : new Response(null, { status: 202 })
}
