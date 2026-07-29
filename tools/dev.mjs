#!/usr/bin/env node
/**
 * learn.cogitave.com - development server.
 *
 * Build once, serve `_site/`, watch the sources, rebuild on change. Opening
 * `_site/index.html` from disk does not work - asset URLs are absolute, so the
 * stylesheet and the fonts 404 - which is why previewing needs a server at all.
 *
 * Live reload is deliberately absent. A reload channel means holding a
 * connection per tab and reasoning about when a rebuild is "done"; a refresh is
 * one key. The build prints its result so you know when there is something new
 * to refresh to.
 *
 * Zero runtime dependencies, per ADR-0003.
 *
 * Usage:  node tools/dev.mjs [--port 4173] [--no-watch]
 */

import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { readFile, stat, realpath } from 'node:fs/promises'
import { watch, existsSync } from 'node:fs'
import { join, extname, dirname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SITE = join(ROOT, '_site')

/**
 * Is an already-resolved absolute path inside the site root?
 *
 * The trailing separator is the whole point. A bare `startsWith(SITE)` also
 * accepts a SIBLING whose name merely begins with the same characters - with a
 * root of `_site`, the directory `_sitemap` passes. Comparing against
 * `_site<sep>` cannot, and the equality case keeps the root itself admissible.
 */
const ROOT_PREFIX = SITE + sep
const contained = (p) => p === SITE || p.startsWith(ROOT_PREFIX)

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const PORT = Number(flag('port', 4173))

// Only what the build actually reads. Watching `_site` would rebuild on its own
// output, and watching `node_modules` would be watching nothing.
const WATCHED = ['cogitave', 'docs', 'snippets', 'tools/assets', 'tools/lib', 'achievements.yml', 'docs.config.json']

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

// ---------------------------------------------------------------------------
// build
// ---------------------------------------------------------------------------

let building = false
let queued = false

function build(reason) {
  if (building) {
    queued = true
    return
  }
  building = true
  const started = Date.now()
  if (reason) process.stdout.write(`\n  ${reason} - rebuilding\n`)

  const child = spawn(process.execPath, [join(HERE, 'build.mjs')], { cwd: ROOT, stdio: 'inherit' })
  child.on('exit', (code) => {
    building = false
    process.stdout.write(
      code === 0
        ? `  rebuilt in ${Date.now() - started}ms - refresh the page\n`
        : `  BUILD FAILED (exit ${code}) - the previous output is still being served\n`,
    )
    if (queued) {
      queued = false
      build('changes arrived during the build')
    }
  })
}

// ---------------------------------------------------------------------------
// watch
// ---------------------------------------------------------------------------

function startWatching() {
  let timer = null
  const onChange = (file) => {
    // Editors write a file several times in a burst; one rebuild is enough.
    clearTimeout(timer)
    timer = setTimeout(() => build(file), 120)
  }

  for (const rel of WATCHED) {
    const target = join(ROOT, rel)
    if (!existsSync(target)) continue
    watch(target, { recursive: true }, (_event, name) => onChange(name ? `${rel}/${name}` : rel))
  }
  process.stdout.write(`  watching ${WATCHED.length} source roots\n`)
}

// ---------------------------------------------------------------------------
// serve
// ---------------------------------------------------------------------------

createServer(async (req, res) => {
  // A malformed escape makes decodeURIComponent throw, which would take the
  // handler down rather than return a status.
  let url
  try {
    url = decodeURIComponent((req.url ?? '/').split('?')[0])
  } catch {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('bad request')
    return
  }

  // A NUL truncates the path in some syscalls, so the string checked is not the
  // string opened. Refuse rather than normalise it away.
  if (url.includes('\0')) {
    res.writeHead(400, { 'content-type': 'text/plain' }).end('bad request')
    return
  }

  const forbid = () => res.writeHead(403, { 'content-type': 'text/plain' }).end('forbidden')

  // `resolve` collapses every `..` first, so what is checked is the path that
  // would actually be opened rather than the one that was typed.
  let path = resolve(SITE, `.${url}`)
  if (!contained(path)) {
    forbid()
    return
  }

  try {
    const found = await stat(path).catch(() => null)
    // Directories and extensionless paths are pretty URLs: `/x/` -> `/x/index.html`.
    if (found?.isDirectory() || (!found && !extname(path))) path = join(path, 'index.html')

    // The check above proves the REQUESTED path is inside the root; it says
    // nothing about where a symlink INSIDE the root points. Resolve the real
    // location, re-check that, and read the resolved path - so the file opened
    // is the file that was verified, not one that was merely spelled like it.
    const real = await realpath(path)
    if (!contained(real)) {
      forbid()
      return
    }

    const body = await readFile(real)
    res.writeHead(200, {
      'content-type': TYPES[extname(real)] ?? 'application/octet-stream',
      // A dev server that caches is a dev server that lies about your last edit.
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end(`404 ${url}`)
  }
}).listen(PORT, () => {
  process.stdout.write(`\n  learn.cogitave.com dev server\n  http://localhost:${PORT}\n\n`)
  build()
  if (!args.includes('--no-watch')) startWatching()
})
