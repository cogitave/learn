/**
 * MCP 2026-07-28 conformance tests.
 *
 * These assert the rules the specification states as MUST/SHOULD, not the
 * behaviour that happens to be convenient. Each test names the rule it pins so
 * a future edit that "simplifies" one of them fails with the reason attached
 * rather than with a diff.
 *
 * Scope: the protocol module and the HTTP binding helpers. The corpus is a
 * two-node stub - what is under test is dispatch, negotiation, and validation,
 * none of which depend on how much content exists.
 *
 * Zero runtime dependencies (ADR-0003): node:test and node:assert only.
 *
 * Run:  node --test tools/mcp/
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  SUPPORTED_PROTOCOL_VERSIONS,
  URI_SCHEME,
  checkHeaders,
  handle,
  httpStatusFor,
} from './protocol.mjs'

const VERSION = SUPPORTED_PROTOCOL_VERSIONS[0]

const state = {
  corpus: new Map([
    ['cogitave.learn.demo', { uid: 'cogitave.learn.demo', title: 'Demo', summary: 'A stub node.', kind: 'unit', source: '' }],
  ]),
  samples: [],
  disabled: () => false,
}

/** A well-formed modern request: the per-request `_meta` is what carries the session. */
const req = (method, params = {}, id = 1) => ({
  jsonrpc: '2.0',
  id,
  method,
  params: {
    ...params,
    _meta: {
      'io.modelcontextprotocol/protocolVersion': VERSION,
      'io.modelcontextprotocol/clientCapabilities': {},
      ...(params._meta ?? {}),
    },
  },
})

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

test('server/discover is implemented and advertises versions, capabilities, identity', () => {
  const r = handle(state, { jsonrpc: '2.0', id: 1, method: 'server/discover' })
  assert.equal(r.result.resultType, 'complete')
  assert.deepEqual(r.result.protocolVersions, SUPPORTED_PROTOCOL_VERSIONS)
  assert.ok(r.result.capabilities, 'capabilities are advertised')
  assert.equal(r.result.serverInfo.name, 'cogitave-learn')
})

test('server/discover answers without _meta, so a probe can learn the version it must send', () => {
  // The bootstrap problem: requiring the version on the call whose purpose is
  // to reveal the version would make discovery unusable.
  const r = handle(state, { jsonrpc: '2.0', id: 1, method: 'server/discover' })
  assert.ok(r.result, 'discovery is exempt from the required-_meta check')
})

test('every result carries resultType and identifies the server in _meta', () => {
  const r = handle(state, req('tools/list'))
  assert.equal(r.result.resultType, 'complete')
  assert.equal(r.result._meta['io.modelcontextprotocol/serverInfo'].name, 'cogitave-learn')
})

// ---------------------------------------------------------------------------
// Version negotiation
// ---------------------------------------------------------------------------

test('an unsupported version is refused with -32022 and the schema field names', () => {
  // A client reads `supported` to pick a version and retry. An invented field
  // name (`supportedVersions`) leaves it with nothing to retry with.
  const r = handle(state, req('tools/list', { _meta: { 'io.modelcontextprotocol/protocolVersion': '1900-01-01' } }))
  assert.equal(r.error.code, -32022)
  assert.deepEqual(r.error.data.supported, SUPPORTED_PROTOCOL_VERSIONS)
  assert.equal(r.error.data.requested, '1900-01-01')
})

test('an unsupported version maps to HTTP 400, not 200', () => {
  const r = handle(state, req('tools/list', { _meta: { 'io.modelcontextprotocol/protocolVersion': '1900-01-01' } }))
  assert.equal(httpStatusFor(r), 400)
})

// ---------------------------------------------------------------------------
// Required per-request metadata
// ---------------------------------------------------------------------------

test('a request without a protocol version is malformed (-32602), not defaulted', () => {
  const r = handle(state, { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
  assert.equal(r.error.code, -32602)
  assert.ok(r.error.data.missing.includes('io.modelcontextprotocol/protocolVersion'))
  assert.equal(httpStatusFor(r), 400)
})

test('a request without client capabilities is malformed', () => {
  const r = handle(state, {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: { _meta: { 'io.modelcontextprotocol/protocolVersion': VERSION } },
  })
  assert.equal(r.error.code, -32602)
  assert.ok(r.error.data.missing.includes('io.modelcontextprotocol/clientCapabilities'))
})

test('a malformed-_meta -32602 is 400, but an ordinary -32602 stays 200', () => {
  // The distinction is real: one is a transport-level failure, the other is a
  // well-formed request that failed on its arguments.
  const bad = handle(state, req('resources/read', { uri: 'cogitave-docs://learn/nope' }))
  assert.equal(bad.error.code, -32602)
  assert.equal(httpStatusFor(bad), 200)
})

test('notifications are exempt and are never answered', () => {
  assert.equal(handle(state, { jsonrpc: '2.0', method: 'notifications/cancelled' }), null)
})

// ---------------------------------------------------------------------------
// Legacy clients
// ---------------------------------------------------------------------------

test('initialize names the versions this server speaks', () => {
  // A legacy client has no fall-forward mechanism, so this error is the only
  // diagnostic its user will ever see. "Unknown method" reads as a broken
  // endpoint; naming the version reads as a newer one.
  const r = handle(state, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25' } })
  assert.equal(r.error.code, -32601)
  assert.deepEqual(r.error.data.supported, SUPPORTED_PROTOCOL_VERSIONS)
  assert.match(r.error.message, /2026-07-28/)
})

test('an unknown method maps to HTTP 404 with a JSON-RPC body', () => {
  const r = handle(state, req('does/not/exist'))
  assert.equal(r.error.code, -32601)
  assert.equal(httpStatusFor(r), 404)
})

// ---------------------------------------------------------------------------
// Header/body agreement (Streamable HTTP)
// ---------------------------------------------------------------------------

const headers = (o) => (n) => o[n.toLowerCase()] ?? null

test('a consistent request passes header validation', () => {
  const msg = req('tools/call', { name: 'docs_search', arguments: { query: 'x' } })
  assert.equal(checkHeaders(headers({ 'mcp-protocol-version': VERSION, 'mcp-method': 'tools/call', 'mcp-name': 'docs_search' }), msg), null)
})

test('a missing MCP-Protocol-Version header is rejected', () => {
  const r = checkHeaders(headers({ 'mcp-method': 'tools/list' }), req('tools/list'))
  assert.equal(r.error.code, -32020)
  assert.equal(httpStatusFor(r), 400)
})

test('a header that disagrees with the body is rejected', () => {
  // The security rule: a load balancer routes on the header while the server
  // executes the body. If they can disagree, they can be made to disagree.
  const msg = req('tools/call', { name: 'docs_search', arguments: {} })
  const r = checkHeaders(headers({ 'mcp-protocol-version': VERSION, 'mcp-method': 'tools/call', 'mcp-name': 'code_sample_search' }), msg)
  assert.equal(r.error.code, -32020)
  assert.match(r.error.message, /does not match/)
})

test('a version header that disagrees with _meta is rejected', () => {
  const r = checkHeaders(headers({ 'mcp-protocol-version': '2025-11-25', 'mcp-method': 'tools/list' }), req('tools/list'))
  assert.equal(r.error.code, -32020)
})

test('Mcp-Name is required for tools/call and resources/read', () => {
  for (const [method, params] of [
    ['tools/call', { name: 'docs_search', arguments: {} }],
    ['resources/read', { uri: URI_SCHEME + 'cogitave.learn.demo' }],
  ]) {
    const r = checkHeaders(headers({ 'mcp-protocol-version': VERSION, 'mcp-method': method }), req(method, params))
    assert.equal(r.error.code, -32020, `${method} must require Mcp-Name`)
  }
})

test('a base64-sentinel Mcp-Name is decoded before it is compared', () => {
  const uri = URI_SCHEME + 'cogitave.learn.demo'
  const encoded = `=?base64?${Buffer.from(uri, 'utf8').toString('base64')}?=`
  const msg = req('resources/read', { uri })
  assert.equal(
    checkHeaders(headers({ 'mcp-protocol-version': VERSION, 'mcp-method': 'resources/read', 'mcp-name': encoded }), msg),
    null,
  )
})

test('an undecodable sentinel is a mismatch, not a pass', () => {
  const msg = req('resources/read', { uri: URI_SCHEME + 'cogitave.learn.demo' })
  const r = checkHeaders(headers({ 'mcp-protocol-version': VERSION, 'mcp-method': 'resources/read', 'mcp-name': '=?base64?!!!!?=' }), msg)
  assert.equal(r.error.code, -32020)
})

test('notifications skip header validation, which this revision does not define for them', () => {
  assert.equal(checkHeaders(headers({}), { jsonrpc: '2.0', method: 'notifications/cancelled' }), null)
})

// ---------------------------------------------------------------------------
// Kill-switch
// ---------------------------------------------------------------------------

test('the kill-switch refuses data methods but keeps discovery answerable', () => {
  // A probe must be able to tell "intentionally down" from "unreachable".
  const off = { ...state, disabled: () => true }
  assert.equal(handle(off, req('tools/list')).error.code, -32001)
  assert.ok(handle(off, { jsonrpc: '2.0', id: 1, method: 'server/discover' }).result)
})
