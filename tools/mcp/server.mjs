#!/usr/bin/env node
/**
 * learn.cogitave.com - MCP server, Node adapter.
 *
 * Serves the corpus over the Model Context Protocol so an agent queries exactly
 * what a person reads. It does not re-parse the content set: it reads the
 * `_api/` projection the build already emitted, so the MCP surface and the site
 * cannot drift. If `_api/` is stale, so is this server - that is intentional,
 * because one build produces both.
 *
 * The protocol, the tool contracts, and retrieval live in protocol.mjs, which
 * imports nothing runtime-specific and is the SAME module the Pages Function at
 * `/mcp` uses (functions/mcp.js). This file answers only the three questions
 * that are environment-specific: where the corpus comes from, how a request
 * arrives, and how the kill-switch resolves. Two runtimes, one implementation.
 *
 * Contract: cogitave/core/docs/mcp-interface.md is the authority. This is a
 * FAITHFUL SUBSET of it, and tools/mcp/README.md lists exactly which parts are
 * implemented and which are not. Do not widen the advertised capabilities beyond
 * what the code actually does.
 *
 * Spec revision: 2026-07-28 (stateless - no initialize handshake, server/discover
 * is the entry point). Transports: stdio and Streamable HTTP.
 * Zero runtime dependencies, per ADR-0003.
 *
 * Usage:
 *   node tools/mcp/server.mjs                 # stdio (local agents, CI, namzu)
 *   node tools/mcp/server.mjs --http [--port 8787] [--site _site]
 *   node tools/mcp/server.mjs --disabled      # kill-switch: refuse data methods
 *
 * Kill-switch (see the block below): COGITAVE_LEARN_MCP_ENABLED=false, the
 * --disabled flag, or a kill-file at COGITAVE_LEARN_MCP_KILLFILE (create to
 * disable / delete to enable, live, no restart).
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { createInterface } from 'node:readline'

import { extractRegions, handleBody, rpcError } from './protocol.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')

// ---------------------------------------------------------------------------
// kill-switch
//
// agentic-operations.md section 6 requires every service to be INDEPENDENTLY
// disable-able in one action, and disablement to be a logged event. Three ways
// to flip it, no dependency:
//   - COGITAVE_LEARN_MCP_ENABLED=false, or the --disabled flag: off at startup.
//   - a kill-file at COGITAVE_LEARN_MCP_KILLFILE: off WHENEVER the file exists,
//     so `touch` disables and `rm` re-enables live, without a restart.
// When off, server/discover still answers so a probe and the client learn the
// service is intentionally down; every data method returns a clean "disabled"
// error, and HTTP returns 503 so a balancer routes around it.
// In production the authoritative kill-switch is the deployment's own switch;
// this server-level one is the self-host / local control.
//
// It lives HERE rather than in protocol.mjs because an env var, a process flag,
// and a file are Node concepts. The protocol takes the answer, not the mechanism.
// ---------------------------------------------------------------------------

const KILLFILE = process.env.COGITAVE_LEARN_MCP_KILLFILE

function isDisabled() {
  if (process.env.COGITAVE_LEARN_MCP_ENABLED === 'false') return true
  if (process.argv.includes('--disabled')) return true
  if (KILLFILE && existsSync(KILLFILE)) return true
  return false
}

// ---------------------------------------------------------------------------
// corpus - loaded once from the build output
// ---------------------------------------------------------------------------

function loadCorpus(siteDir) {
  const apiDir = join(siteDir, '_api')
  if (!existsSync(join(apiDir, 'index.json'))) {
    throw new Error(
      `no corpus at ${apiDir}. Run \`npm run build\` first - this server reads the build output, it does not parse content itself.`,
    )
  }
  // The aggregates are for the edge adapter, which has no filesystem; on Node
  // the per-node files are the source, so skip them rather than double-count.
  const AGGREGATES = new Set(['index.json', 'corpus.json', 'code-samples.json'])
  const nodes = readdirSync(apiDir)
    .filter((f) => f.endsWith('.json') && !AGGREGATES.has(f))
    .map((f) => JSON.parse(readFileSync(join(apiDir, f), 'utf8')))
  return new Map(nodes.map((n) => [n.uid, n]))
}

/**
 * The snippet registry is excluded from the published content set, so on Node it
 * is read from the tree. The edge adapter cannot do that and reads the build's
 * `code-samples.json` projection instead; both end up with the same shape.
 */
function loadSnippets(snippetDir) {
  if (!existsSync(snippetDir)) return []
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else files.push(full)
    }
  }
  walk(snippetDir)
  return files.flatMap((file) =>
    extractRegions(
      readFileSync(file, 'utf8'),
      `snippets/${relative(snippetDir, file).split(sep).join('/')}`,
      file.endsWith('.ts') ? 'typescript' : '',
    ),
  )
}

// ---------------------------------------------------------------------------
// transports
// ---------------------------------------------------------------------------

function serveStdio(state) {
  const rl = createInterface({ input: process.stdin })
  rl.on('line', (line) => {
    if (!line.trim()) return
    const reply = handleBody(state, line)
    if (reply) process.stdout.write(`${JSON.stringify(reply)}\n`)
  })
  process.stderr.write(
    `cogitave-learn MCP (stdio) ready - ${state.corpus.size} nodes${isDisabled() ? ' [DISABLED: kill-switch active]' : ''}\n`,
  )
}

/**
 * Streamable HTTP. Origin is validated and rejected with 403 per the transport
 * spec, which is the DNS-rebinding defence for a locally bound server.
 */
function serveHttp(state, port) {
  const ALLOWED = new Set([
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
    'https://learn.cogitave.com',
  ])
  const MAX_BODY = 1_000_000

  createServer((req, res) => {
    const origin = req.headers.origin
    if (origin && !ALLOWED.has(origin)) {
      res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden origin')
      return
    }
    // Kill-switch: a hard 503 so the gateway / health monitor sees the endpoint
    // as down and routes around it.
    if (isDisabled()) {
      res.writeHead(503, { 'content-type': 'text/plain', 'retry-after': '30' }).end('learn MCP is disabled')
      return
    }
    if (req.method !== 'POST') {
      // No server-initiated stream: nothing here pushes, so there is no SSE to open.
      res.writeHead(405, { 'content-type': 'text/plain', allow: 'POST' }).end('POST only')
      return
    }

    let body = ''
    let aborted = false
    req.on('data', (c) => {
      body += c
      if (body.length > MAX_BODY) {
        aborted = true
        res.writeHead(413, { 'content-type': 'application/json' }).end(
          JSON.stringify(rpcError(null, -32600, 'Request body too large.')),
        )
        req.destroy()
      }
    })
    req.on('end', () => {
      if (aborted) return
      const reply = handleBody(state, body)
      if (!reply) {
        res.writeHead(202).end() // notification only
        return
      }
      const out = JSON.stringify(reply)
      res
        .writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(out) })
        .end(out)
    })
  }).listen(port, '127.0.0.1', () => {
    process.stderr.write(
      `cogitave-learn MCP (Streamable HTTP) on http://127.0.0.1:${port}/ - ${state.corpus.size} nodes, ${state.samples.length} code samples${isDisabled() ? ' [DISABLED: kill-switch active, serving 503]' : ''}\n`,
    )
  })
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const siteDir = resolve(ROOT, flag('site', '_site'))
const state = {
  corpus: loadCorpus(siteDir),
  samples: loadSnippets(join(ROOT, 'snippets')),
  disabled: isDisabled,
}

if (args.includes('--http')) serveHttp(state, Number(flag('port', 8787)))
else serveStdio(state)
