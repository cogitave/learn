/**
 * MCP protocol and retrieval for learn.cogitave.com - runtime-agnostic.
 *
 * Nothing in this file may import `node:` anything, read `process`, or touch a
 * filesystem. It runs unchanged on Node (tools/mcp/server.mjs) and on workerd
 * (functions/mcp.js, the Pages Function behind /mcp), so the endpoint an
 * agent runs locally and the one the edge serves are the SAME implementation
 * rather than two that drift.
 *
 * The runtime adapters supply everything environment-specific:
 *
 *   state = {
 *     corpus:   Map<uid, node>,   // from the build's `_api/` projection
 *     samples:  Array<sample>,    // named regions of the snippet registry
 *     disabled: () => boolean,    // the kill-switch, resolved by the runtime
 *   }
 *
 * The kill-switch lives in the ADAPTER, not here: Node reads an env var, a flag,
 * and a kill-file; an edge runtime has none of those. Keeping the decision out
 * of the protocol is what lets both honour agentic-operations.md section 6
 * without this file knowing what a file is.
 *
 * Contract: cogitave/core/docs/mcp-interface.md. tools/mcp/README.md records
 * which parts of it are implemented and which are deliberately not.
 */

// This server prefers MCP 2026-07-28, stateless: a `server/discover` RPC, the
// protocol version carried per-request in `_meta`, `resultType` on every result,
// and header/body mirroring on the HTTP transport. It ALSO accepts the older
// handshake-based 2025-11-25 revision, because that is what shipping clients
// still speak: a request that does not declare 2026-07-28 is served the legacy
// way - `initialize` handshake, no per-request `_meta`, no header mirroring - so
// the endpoint works with today's agents while staying correct for 2026-07-28
// ones. The strict 2026-07-28 rules apply ONLY to a request that declares that
// version; they are never imposed on a legacy client. See tools/mcp/README.md.
//
// "Modern" throughout this file means: the request declares 2026-07-28 (in the
// `_meta` protocol version and, on HTTP, the mirrored header). Anything else is
// legacy and permissive.
export const PROTOCOL_VERSION = '2026-07-28'
export const SUPPORTED_PROTOCOL_VERSIONS = ['2026-07-28', '2025-11-25']
export const MODERN_VERSION = '2026-07-28'
export const SERVER_INFO = { name: 'cogitave-learn', title: 'Cogitave Learn', version: '0.1.0' }
export const URI_SCHEME = 'cogitave-docs://learn/'
export const SITE_URL = 'https://learn.cogitave.com'

// Bounded so a hostile or accidental query cannot turn into unbounded work.
const MAX_QUERY_TERMS = 24
const MAX_TOP_K = 50
// The corpus is a static build, so list/read results are cacheable: a freshness
// hint (ms) a client may cache against, publicly (no per-caller state here).
const LIST_CACHE_MS = 3600000

// ---------------------------------------------------------------------------
// retrieval
//
// Lexical only. The Core contract specifies hybrid retrieval - BM25 plus vectors
// plus a graph rerank. There is no embedding store here, so this scores term
// overlap across weighted fields. Do not describe it as semantic search.
// ---------------------------------------------------------------------------

export const terms = (s) =>
  String(s ?? '')
    .toLowerCase()
    .split(/[^a-z0-9@/._-]+/)
    .filter((t) => t.length > 1)

const FIELD_WEIGHT = { title: 6, summary: 3, headings: 2, source: 1 }

function score(node, queryTerms) {
  const fields = {
    title: terms(node.title),
    summary: terms(node.summary),
    headings: terms((node.headings ?? []).join(' ')),
    source: terms(node.source),
  }
  let total = 0
  for (const t of queryTerms) {
    for (const [field, weight] of Object.entries(FIELD_WEIGHT)) {
      const hits = fields[field].filter((w) => w === t || w.startsWith(t)).length
      // Saturating, so one long page cannot outrank a precise title match.
      if (hits) total += weight * (1 + Math.log(hits))
    }
  }
  return total
}

export function search(corpus, { query, topK = 10, product, types }) {
  const q = terms(query).slice(0, MAX_QUERY_TERMS)
  if (!q.length) return []
  const wanted = Array.isArray(types) && types.length ? new Set(types) : null
  const limit = Math.max(1, Math.min(MAX_TOP_K, Number(topK) || 10))

  return [...corpus.values()]
    .filter((n) => (!wanted || wanted.has(n.kind)) && (!product || (n.products ?? []).includes(product)))
    .map((n) => ({ node: n, s: score(n, q) }))
    .filter((r) => r.s > 0)
    // Ties break on uid so the same query always returns the same order.
    .sort((a, b) => b.s - a.s || a.node.uid.localeCompare(b.node.uid))
    .slice(0, limit)
    .map(({ node, s }) => ({
      uid: node.uid,
      title: node.title,
      uri: URI_SCHEME + node.uid,
      kind: node.kind,
      snippet: (node.summary || node.source || '').slice(0, 240).trim(),
      score: Number(s.toFixed(3)),
    }))
}

// ---------------------------------------------------------------------------
// relatedness
//
// Two nodes are related when they teach the same things. Products and subjects
// are the strong signal - what a page is about; roles and levels are weaker -
// who it is for and how hard. A shared parent path is a small proximity nudge.
// The node itself and the edges already one click away (its parent, its
// children) are excluded, so "related" surfaces what navigation does not.
//
// One scorer, two callers: the /mcp `get_related` tool passes the corpus, and
// the build passes the same-shaped catalogue to render the on-page "Related"
// section - so the reader and an agent see the same neighbours.
// ---------------------------------------------------------------------------

const REL_WEIGHT = { products: 5, subjects: 4, roles: 1, levels: 1 }

export function related(nodes, uid, { topK = 6, kinds } = {}) {
  const target = nodes.find((n) => n.uid === uid)
  if (!target) return []
  const exclude = new Set([uid])
  if (target.partOf) exclude.add(target.partOf)
  for (const u of target.units ?? []) exclude.add(u)
  for (const m of target.modules ?? []) exclude.add(m)

  const tset = {}
  for (const axis of Object.keys(REL_WEIGHT)) tset[axis] = new Set(target[axis] ?? [])
  const wanted = Array.isArray(kinds) && kinds.length ? new Set(kinds) : null
  const limit = Math.max(1, Math.min(MAX_TOP_K, Number(topK) || 6))

  return nodes
    .filter((n) => !exclude.has(n.uid) && (!wanted || wanted.has(n.kind)))
    .map((n) => {
      let s = 0
      for (const [axis, w] of Object.entries(REL_WEIGHT)) {
        let overlap = 0
        for (const v of n[axis] ?? []) if (tset[axis].has(v)) overlap += 1
        s += w * overlap
      }
      if (target.partOf && n.partOf && n.partOf === target.partOf) s += 2
      return { n, s }
    })
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.n.uid.localeCompare(b.n.uid))
    .slice(0, limit)
    .map(({ n, s }) => ({ uid: n.uid, title: n.title, kind: n.kind, href: n.href, summary: n.summary, score: s }))
}

// ---------------------------------------------------------------------------
// tools
// ---------------------------------------------------------------------------

export const TOOLS = [
  {
    name: 'docs_search',
    title: 'Search documentation and training',
    description:
      'Lexical search over every published learning path, module, unit, and documentation page. Returns UIDs to fetch.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
        product: { type: 'string', description: 'Product filter, e.g. "namzu" or "yuva".' },
        types: {
          type: 'array',
          items: { enum: ['doc', 'moduleUnit', 'module', 'learningPath'] },
          description: 'Restrict to these node kinds.',
        },
        topK: { type: 'integer', minimum: 1, maximum: MAX_TOP_K, default: 10 },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['results'],
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['uid', 'title', 'uri', 'score'],
            properties: {
              uid: { type: 'string' },
              title: { type: 'string' },
              uri: { type: 'string' },
              kind: { type: 'string' },
              snippet: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
      },
    },
  },
  {
    name: 'docs_fetch',
    title: 'Fetch a page by UID',
    description: 'Return the full authored content of one node, plus its taxonomy and graph edges.',
    inputSchema: { type: 'object', required: ['uid'], properties: { uid: { type: 'string' } } },
    outputSchema: {
      type: 'object',
      required: ['uid', 'kind', 'title', 'content'],
      properties: {
        uid: { type: 'string' },
        kind: { type: 'string' },
        title: { type: 'string' },
        summary: { type: 'string' },
        url: { type: 'string' },
        content: { type: 'string', description: 'Authored markdown.' },
        products: { type: 'array', items: { type: 'string' } },
        roles: { type: 'array', items: { type: 'string' } },
        levels: { type: 'array', items: { type: 'string' } },
        subjects: { type: 'array', items: { type: 'string' } },
        headings: { type: 'array', items: { type: 'string' } },
        partOf: { type: 'string', description: 'UID of the parent (a unit\'s module, a module\'s path).' },
        units: { type: 'array', items: { type: 'string' }, description: 'Child unit UIDs, for a module.' },
        modules: { type: 'array', items: { type: 'string' }, description: 'Child module UIDs, for a learning path.' },
        quiz: { type: 'object', description: 'The knowledge-check questions, for an assessment unit.' },
      },
    },
  },
  {
    name: 'code_sample_search',
    title: 'Search code samples',
    description:
      'Search the named regions of the snippet registry - the code the corpus pulls by reference, so a sample here is the sample a reader sees.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string' },
        topK: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['results'],
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['source', 'region', 'code'],
            properties: {
              source: { type: 'string' },
              region: { type: 'string' },
              language: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
  },
  {
    name: 'list_catalogue',
    title: 'List the catalogue',
    description:
      'Enumerate the corpus - every learning path, module, unit, and doc - so a tools-only client can browse without a search query. Optionally filter by kind or product.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', description: 'Filter: learningPath | module | moduleUnit | doc.' },
        product: { type: 'string', description: 'Filter to nodes tagged with this product.' },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['count', 'nodes'],
      properties: {
        count: { type: 'number' },
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uid: { type: 'string' },
              kind: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
              products: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  {
    name: 'get_related',
    title: 'Find related content',
    description:
      'Given a UID, return the nodes that teach the same products and subjects - the neighbours a reader would want next, ranked by shared taxonomy. The node itself, its parent, and its children are excluded, since navigation already reaches those.',
    inputSchema: {
      type: 'object',
      required: ['uid'],
      properties: {
        uid: { type: 'string', description: 'The node to find neighbours for.' },
        topK: { type: 'integer', minimum: 1, maximum: MAX_TOP_K, default: 6 },
        kinds: {
          type: 'array',
          items: { enum: ['doc', 'moduleUnit', 'module', 'learningPath'] },
          description: 'Restrict the neighbours to these kinds.',
        },
      },
    },
    outputSchema: {
      type: 'object',
      required: ['results'],
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            required: ['uid', 'title', 'uri', 'score'],
            properties: {
              uid: { type: 'string' },
              title: { type: 'string' },
              uri: { type: 'string' },
              kind: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
      },
    },
  },
  {
    name: 'resolve_xref',
    title: 'Resolve a UID',
    description:
      'Resolve a UID to the node it names - its kind, title, and where to read it (uri + url) - without fetching the whole node. The lightweight step for following an @uid reference.',
    inputSchema: { type: 'object', required: ['uid'], properties: { uid: { type: 'string' } } },
    outputSchema: {
      type: 'object',
      required: ['uid', 'kind', 'title', 'uri', 'url'],
      properties: {
        uid: { type: 'string' },
        kind: { type: 'string' },
        title: { type: 'string' },
        uri: { type: 'string' },
        url: { type: 'string' },
      },
    },
  },
  {
    name: 'get_learning_path',
    title: 'Get the learning path to a competency',
    description:
      'Given a module, unit, or path UID, return the ordered learning path(s) that reach it - the module sequence to walk and where the target sits in it - so an agent (or a person) can plan how to acquire a competency.',
    inputSchema: { type: 'object', required: ['uid'], properties: { uid: { type: 'string' } } },
    outputSchema: {
      type: 'object',
      required: ['paths'],
      properties: {
        paths: {
          type: 'array',
          items: {
            type: 'object',
            required: ['path', 'modules'],
            properties: {
              path: {
                type: 'object',
                properties: { uid: { type: 'string' }, title: { type: 'string' }, uri: { type: 'string' } },
              },
              modules: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { uid: { type: 'string' }, title: { type: 'string' }, uri: { type: 'string' } },
                },
              },
              targetIndex: { type: 'integer', description: 'Position of the target module in the sequence, or -1.' },
            },
          },
        },
      },
    },
  },
]

/** Input validation failures are tool errors, not protocol errors (SEP-1303). */
const toolError = (message) => ({ content: [{ type: 'text', text: message }], isError: true })
const toolOk = (structuredContent, text) => ({ content: [{ type: 'text', text }], structuredContent })

export function callTool(state, name, args = {}) {
  if (name === 'docs_search') {
    if (typeof args.query !== 'string' || !args.query.trim()) {
      return toolError('docs_search requires a non-empty string "query".')
    }
    const results = search(state.corpus, args)
    return toolOk(
      { results },
      results.length
        ? results.map((r) => `${r.uid}\n  ${r.title} (${r.kind}, score ${r.score})\n  ${r.snippet}`).join('\n\n')
        : `No match for "${args.query}".`,
    )
  }

  if (name === 'docs_fetch') {
    if (typeof args.uid !== 'string') return toolError('docs_fetch requires a string "uid".')
    const node = state.corpus.get(args.uid)
    if (!node) {
      const near = search(state.corpus, { query: args.uid, topK: 3 }).map((r) => r.uid)
      return toolError(
        `Unknown uid "${args.uid}".` + (near.length ? ` Closest: ${near.join(', ')}.` : ' Use docs_search first.'),
      )
    }
    const out = {
      uid: node.uid,
      kind: node.kind,
      title: node.title,
      summary: node.summary,
      url: SITE_URL + node.href,
      content: node.source ?? '',
      products: node.products ?? [],
      roles: node.roles ?? [],
      levels: node.levels ?? [],
      subjects: node.subjects ?? [],
      headings: node.headings ?? [],
    }
    if (node.quiz) out.quiz = node.quiz
    if (node.units) out.units = node.units
    if (node.modules) out.modules = node.modules
    if (node.partOf) out.partOf = node.partOf
    return toolOk(out, `# ${out.title}\n\n${out.summary}\n\n${out.content}`)
  }

  if (name === 'code_sample_search') {
    if (typeof args.query !== 'string' || !args.query.trim()) {
      return toolError('code_sample_search requires a non-empty string "query".')
    }
    const q = terms(args.query).slice(0, MAX_QUERY_TERMS)
    const results = state.samples
      .map((s) => ({
        s,
        n: q.filter((t) => `${s.region} ${s.source} ${s.code}`.toLowerCase().includes(t)).length,
      }))
      .filter((r) => r.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, Math.max(1, Math.min(20, Number(args.topK) || 5)))
      .map((r) => r.s)
    return toolOk(
      { results },
      results.length
        ? results.map((r) => `${r.source}#${r.region}\n\n${r.code}`).join('\n\n---\n\n')
        : `No code sample matches "${args.query}".`,
    )
  }

  if (name === 'list_catalogue') {
    let nodes = [...state.corpus.values()];
    if (typeof args.kind === 'string') nodes = nodes.filter((n) => n.kind === args.kind);
    if (typeof args.product === 'string') nodes = nodes.filter((n) => (n.products ?? []).includes(args.product));
    const list = nodes.map((n) => ({
      uid: n.uid,
      kind: n.kind,
      title: n.title,
      url: SITE_URL + n.href,
      products: n.products ?? [],
    }));
    const text = list.length
      ? list.map((n) => `- [${n.kind}] ${n.title} (${n.uid})`).join('\n')
      : 'No nodes match that filter.';
    return toolOk({ count: list.length, nodes: list }, text);
  }

  if (name === 'get_related') {
    if (typeof args.uid !== 'string') return toolError('get_related requires a string "uid".')
    if (!state.corpus.has(args.uid)) {
      const near = search(state.corpus, { query: args.uid, topK: 3 }).map((r) => r.uid)
      return toolError(
        `Unknown uid "${args.uid}".` + (near.length ? ` Closest: ${near.join(', ')}.` : ' Use docs_search first.'),
      )
    }
    const results = related([...state.corpus.values()], args.uid, {
      topK: args.topK,
      kinds: args.kinds,
    }).map((r) => ({ uid: r.uid, title: r.title, uri: URI_SCHEME + r.uid, kind: r.kind, score: r.score }))
    return toolOk(
      { results },
      results.length
        ? results.map((r) => `${r.uid}\n  ${r.title} (${r.kind}, score ${r.score})`).join('\n\n')
        : `No related nodes for "${args.uid}".`,
    )
  }

  if (name === 'resolve_xref') {
    if (typeof args.uid !== 'string') return toolError('resolve_xref requires a string "uid".')
    const node = state.corpus.get(args.uid)
    if (!node) {
      const near = search(state.corpus, { query: args.uid, topK: 3 }).map((r) => r.uid)
      return toolError(
        `Unknown uid "${args.uid}".` + (near.length ? ` Closest: ${near.join(', ')}.` : ' Use docs_search first.'),
      )
    }
    const out = {
      uid: node.uid,
      kind: node.kind,
      title: node.title,
      uri: URI_SCHEME + node.uid,
      url: SITE_URL + node.href,
    }
    return toolOk(out, `${out.uid}\n  ${out.title} (${out.kind})\n  ${out.url}`)
  }

  if (name === 'get_learning_path') {
    if (typeof args.uid !== 'string') return toolError('get_learning_path requires a string "uid".')
    const node = state.corpus.get(args.uid)
    if (!node) {
      const near = search(state.corpus, { query: args.uid, topK: 3 }).map((r) => r.uid)
      return toolError(
        `Unknown uid "${args.uid}".` + (near.length ? ` Closest: ${near.join(', ')}.` : ' Use docs_search first.'),
      )
    }
    // Resolve the target to the module the path orders by: a unit's parent module,
    // a module as itself. A path input matches itself. A doc belongs to no path.
    const targetModule = node.kind === 'moduleUnit' ? node.partOf : node.kind === 'module' ? node.uid : null
    const ref = (uid) => {
      const n = state.corpus.get(uid)
      return n ? { uid: n.uid, title: n.title, uri: URI_SCHEME + n.uid } : { uid, title: uid, uri: URI_SCHEME + uid }
    }
    const paths = [...state.corpus.values()]
      .filter(
        (n) =>
          n.kind === 'learningPath' &&
          (n.uid === args.uid || (targetModule && (n.modules ?? []).includes(targetModule))),
      )
      .map((p) => ({
        path: { uid: p.uid, title: p.title, uri: URI_SCHEME + p.uid },
        modules: (p.modules ?? []).map(ref),
        targetIndex: targetModule ? (p.modules ?? []).indexOf(targetModule) : -1,
      }))
    const text = paths.length
      ? paths
          .map(
            (p) =>
              `${p.path.title}\n` +
              p.modules.map((m, i) => `  ${i === p.targetIndex ? '>' : ' '} ${i + 1}. ${m.title}`).join('\n'),
          )
          .join('\n\n')
      : `No learning path reaches "${args.uid}".`
    return toolOk({ paths }, text)
  }

  return toolError(`Unknown tool "${name}".`)
}

// ---------------------------------------------------------------------------
// JSON-RPC
// ---------------------------------------------------------------------------

// Every result carries `resultType: "complete"` and identifies the server in
// `_meta`, per MCP 2026-07-28. (`input_required` never occurs here - this server
// issues no server-initiated requests, so a result is always complete.)
export const rpcResult = (id, result) => ({
  jsonrpc: '2.0',
  id,
  result: {
    resultType: 'complete',
    ...result,
    _meta: { 'io.modelcontextprotocol/serverInfo': SERVER_INFO, ...(result._meta ?? {}) },
  },
})
export const rpcError = (id, code, message, data) => ({
  jsonrpc: '2.0',
  id,
  error: data === undefined ? { code, message } : { code, message, data },
})

/**
 * Discovery stays answerable while the kill-switch is active, so a probe learns
 * the service is intentionally down instead of timing out. Every data method
 * refuses.
 */
const ALWAYS_ALLOWED = new Set(['server/discover', 'notifications/cancelled'])

/** Returns the reply object, or null for a notification (which gets no reply). */
export function handle(state, msg) {
  const { id, method } = msg ?? {}
  // Default on null and non-objects too, not just undefined: `"params": null` is
  // a valid JSON-RPC message and must not crash `params.name`/`params.uri`.
  const params = msg?.params && typeof msg.params === 'object' ? msg.params : {}
  const isNotification = id === undefined || id === null

  if (state.disabled?.() && !ALWAYS_ALLOWED.has(method)) {
    return isNotification ? null : rpcError(id, -32001, 'learn MCP is disabled (kill-switch active).')
  }

  // Stateless version negotiation (2026-07-28): a request declares its protocol
  // version in `_meta`; reject one we do not support. server/discover is exempt -
  // a client calls it to LEARN which versions we serve, so answering it is
  // strictly more useful than refusing it. The compatibility matrix admits both
  // a DiscoverResult and an UnsupportedProtocolVersionError from that probe.
  const meta = params?._meta && typeof params._meta === 'object' ? params._meta : {}
  const reqVersion = meta['io.modelcontextprotocol/protocolVersion']
  // Modern iff the request declares 2026-07-28; only then do the strict rules
  // (per-request `_meta`, header mirroring) apply. A legacy client sends no
  // version here, so it is served permissively.
  const modern = reqVersion === MODERN_VERSION
  const isDiscover = method === 'server/discover'
  // `server/discover` is how a client LEARNS the versions we serve, and
  // `initialize` is the legacy handshake itself, so neither can be held to the
  // modern `_meta` contract without defeating its own purpose.
  const isEraProbe = isDiscover || method === 'initialize'

  // Reject only a version we do not serve at all (neither 2026-07-28 nor
  // 2025-11-25). A request that declares nothing is legacy and passes;
  // server/discover is exempt so a client can always learn what we speak.
  if (reqVersion && !SUPPORTED_PROTOCOL_VERSIONS.includes(reqVersion) && !isDiscover) {
    return isNotification
      ? null
      : // Field names are fixed by UnsupportedProtocolVersionError in the schema:
        // `supported` and `requested`. A client reads `supported` to pick a
        // version and retry, so an invented name silently breaks that retry.
        rpcError(id, -32022, `Unsupported protocol version "${reqVersion}". This server speaks ${SUPPORTED_PROTOCOL_VERSIONS.join(' and ')}.`, {
          supported: SUPPORTED_PROTOCOL_VERSIONS,
          requested: reqVersion,
        })
  }

  // For a MODERN request the per-request `_meta` fields ARE the session that
  // 2026-07-28 removed: accepting one without them would infer state the client
  // never sent, so a missing field is malformed (-32602). A legacy request is
  // exempt - it negotiated at `initialize` instead.
  if (modern && !isNotification && !isEraProbe) {
    const caps = meta['io.modelcontextprotocol/clientCapabilities']
    if (!caps || typeof caps !== 'object') {
      return rpcError(id, -32602, 'Missing required _meta field: io.modelcontextprotocol/clientCapabilities.', {
        missing: ['io.modelcontextprotocol/clientCapabilities'],
      })
    }
  }

  switch (method) {
    case 'server/discover':
      // MUST-implement in 2026-07-28: advertise supported versions, capabilities,
      // and identity in one request, so a client selects a version up front (or
      // uses it as a probe on stdio). `subscribe`/`listChanged` are deliberately
      // absent: this reads a built artifact and cannot notice a change, so
      // claiming them would be a lie a client acts on.
      return rpcResult(id, {
        protocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
        capabilities: { tools: {}, resources: {}, extensions: {} },
        serverInfo: SERVER_INFO,
        instructions:
          'Stateless MCP 2026-07-28: send requests directly, each carrying io.modelcontextprotocol/protocolVersion in _meta. Search with docs_search, read with docs_fetch by uid; resolve_xref resolves a uid to its node, get_learning_path returns the ordered path to a competency, get_related finds neighbours, code_sample_search returns the snippets the corpus pulls by reference, list_catalogue enumerates everything.',
      })

    case 'notifications/cancelled':
      return null

    case 'tools/list':
      // Deterministic order + a cache hint, so a client can cache the list.
      return rpcResult(id, { tools: TOOLS, ttlMs: LIST_CACHE_MS, cacheScope: 'public' })

    case 'tools/call':
      if (!params.name) return rpcError(id, -32602, 'tools/call requires "name".')
      return rpcResult(id, callTool(state, params.name, params.arguments ?? {}))

    case 'resources/list':
      return rpcResult(id, {
        resources: [...state.corpus.values()].map((n) => ({
          uri: URI_SCHEME + n.uid,
          name: n.title,
          description: n.summary,
          mimeType: 'text/markdown',
        })),
        ttlMs: LIST_CACHE_MS,
        cacheScope: 'public',
      })

    case 'resources/read': {
      const uri = params.uri ?? ''
      const node = state.corpus.get(uri.startsWith(URI_SCHEME) ? uri.slice(URI_SCHEME.length) : uri)
      // -32602 (Invalid Params), aligned with JSON-RPC per 2026-07-28.
      if (!node) return rpcError(id, -32602, `Unknown resource "${uri}".`)
      return rpcResult(id, {
        contents: [
          { uri, mimeType: 'text/markdown', text: `# ${node.title}\n\n${node.summary}\n\n${node.source ?? ''}` },
        ],
        ttlMs: LIST_CACHE_MS,
        cacheScope: 'public',
      })
    }

    // The 2025-11-25 handshake. A shipping client opens with this, so answer it -
    // then it lists and calls tools the legacy way (no per-request `_meta`, no
    // header mirroring). Echo the version it asked for when we serve it, else our
    // legacy floor. The reply is a plain handshake object with NO 2026-07-28
    // `resultType`/`_meta` wrapper, so a strict legacy client sees exactly the
    // shape it expects.
    case 'initialize': {
      if (isNotification) return null
      const asked = typeof params.protocolVersion === 'string' ? params.protocolVersion : '2025-11-25'
      const agreed = SUPPORTED_PROTOCOL_VERSIONS.includes(asked) ? asked : '2025-11-25'
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: agreed,
          capabilities: { tools: {}, resources: {} },
          serverInfo: SERVER_INFO,
          instructions:
            'The learn corpus over MCP. Search with docs_search, read with docs_fetch by uid; resolve_xref resolves a uid, get_learning_path returns the ordered path to a competency, get_related finds neighbours, code_sample_search returns snippets, list_catalogue enumerates everything.',
        },
      }
    }

    // Optional keepalive a legacy client may send; an empty result is the whole
    // contract.
    case 'ping':
      return isNotification ? null : { jsonrpc: '2.0', id, result: {} }

    // `notifications/initialized` and any other notification need no reply; the
    // ternary returns null for them.
    default:
      return isNotification ? null : rpcError(id, -32601, `Unknown method "${method}".`)
  }
}

/**
 * One request body -> one reply body, shared by both transports. Accepts a
 * single message or a batch, and returns null when nothing needs answering.
 */
export function handleBody(state, text) {
  let msg
  try {
    msg = JSON.parse(text)
  } catch (e) {
    return rpcError(null, -32700, `Parse error: ${e.message}`)
  }
  if (Array.isArray(msg)) {
    const replies = msg.map((m) => handle(state, m)).filter(Boolean)
    return replies.length ? replies : null
  }
  return handle(state, msg)
}

// ---------------------------------------------------------------------------
// Streamable HTTP binding
// ---------------------------------------------------------------------------
//
// The transport mirrors selected body fields into headers so an intermediary
// can route without parsing the body. That only holds if the two agree, so the
// server MUST reject any request where they disagree - otherwise a load
// balancer routes on one value while the server executes another. These two
// helpers live here, not in the Function, because the rule belongs to the
// protocol; the Function only supplies the headers and applies the status.

/** `=?base64?...?=` carries a value that is not safe as a plain ASCII header. */
function decodeHeaderValue(v) {
  if (typeof v !== 'string' || !v.startsWith('=?base64?') || !v.endsWith('?=')) return v
  const b64 = v.slice('=?base64?'.length, -'?='.length)
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)))
  } catch {
    return null // Undecodable is a mismatch, not a pass.
  }
}

/** Methods whose subject is mirrored into `Mcp-Name`. */
const NAMED_METHODS = new Set(['tools/call', 'resources/read', 'prompts/get'])

/**
 * Validate the mirrored request headers against the parsed body.
 *
 * `get` is a case-insensitive header lookup, so this works with a `Headers`
 * object, a Node `req.headers` bag, or a plain map.
 *
 * Returns a JSON-RPC error reply, or null when the request is consistent.
 * Notifications are exempt: this revision does not define header requirements
 * for them.
 */
export function checkHeaders(get, msg) {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return null
  const { id, method } = msg
  if (id === undefined || id === null) return null

  // Header/body mirroring is a 2026-07-28 transport rule, so enforce it ONLY when
  // the request declares 2026-07-28 (in the mirrored header or the body `_meta`).
  // A legacy 2025-11-25 client sends neither the mirror headers nor that marker,
  // so it is exempt and can connect - which is the whole point of back-compat.
  const version = get('mcp-protocol-version')
  const bodyVersion = msg.params?._meta?.['io.modelcontextprotocol/protocolVersion']
  if (version !== MODERN_VERSION && bodyVersion !== MODERN_VERSION) return null

  const bad = (m) => rpcError(id, -32020, `Header mismatch: ${m}`)

  if (!version) return bad('the MCP-Protocol-Version header is required on a 2026-07-28 request.')
  if (bodyVersion !== undefined && version !== bodyVersion) {
    return bad(`MCP-Protocol-Version "${version}" does not match the _meta protocol version "${bodyVersion}".`)
  }

  const hMethod = get('mcp-method')
  if (!hMethod) return bad('the Mcp-Method header is required on a 2026-07-28 request.')
  if (hMethod !== method) return bad(`Mcp-Method "${hMethod}" does not match the body method "${method}".`)

  if (NAMED_METHODS.has(method)) {
    const raw = get('mcp-name')
    if (!raw) return bad(`the Mcp-Name header is required for "${method}".`)
    const name = decodeHeaderValue(raw)
    const bodyName = method === 'tools/call' ? msg.params?.name : msg.params?.uri
    if (name === null) return bad('the Mcp-Name header is not valid base64.')
    if (bodyName !== undefined && name !== bodyName) {
      return bad(`Mcp-Name "${name}" does not match the body value "${bodyName}".`)
    }
  }

  return null
}

/**
 * The HTTP status a reply must carry. The transport binds specific JSON-RPC
 * errors to specific statuses, and a client uses the status to decide whether
 * to retry, re-negotiate, or fall back to a legacy handshake - so answering
 * every error with 200 makes a modern server look like a broken one.
 */
export function httpStatusFor(reply) {
  const code = reply?.error?.code
  if (code === undefined) return 200
  switch (code) {
    case -32020: // HeaderMismatch
    case -32021: // MissingRequiredClientCapability
    case -32022: // UnsupportedProtocolVersion
    case -32700: // Parse error
    case -32600: // Invalid request
      return 400
    case -32601: // Method not found - distinguishable from a legacy 404 by the body.
      return 404
    case -32001: // Kill-switch.
      return 503
    case -32602:
      // Only the malformed-`_meta` case is a transport-level failure; a bad
      // argument or an unknown resource is a well-formed request that failed.
      return reply.error.data?.missing ? 400 : 200
    default:
      return 200
  }
}

/**
 * Named regions in a snippet file: a line that is ONLY a comment marker.
 *
 * The marker must own its line. A looser pattern matches prose that merely
 * mentions the convention - the registry's own header comment explains
 * `// <region>` in a sentence, and a permissive regex turns that sentence into
 * a phantom sample called "region".
 */
export function extractRegions(text, source, language = '') {
  const out = []
  const re =
    /^[ \t]*(?:\/\/|#|--)[ \t]*<([A-Za-z0-9_-]+)>[ \t]*$([\s\S]*?)^[ \t]*(?:\/\/|#|--)[ \t]*<\/\1>[ \t]*$/gm
  let m
  while ((m = re.exec(text)) !== null) out.push({ source, region: m[1], language, code: dedent(m[2]) })
  return out
}

export function dedent(s) {
  const lines = String(s).replace(/^\n+|\n+$/g, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join('\n')
}
