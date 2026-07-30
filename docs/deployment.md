---
uid: cogitave.learn.docs.deployment
title: Deployment and delivery - learn.cogitave.com
description: How learn.cogitave.com and the cogitave-learn plugin are built, validated, promoted, and deployed to Cloudflare Pages as a free, public site and MCP endpoint, and which steps stay human-gated.
type: how-to
owner: cogitave/platform
lastReviewed: 2026-07-30
roles:
  - developer
  - platform-engineer
level: intermediate
visibility: internal   # engineering document: stays in git, not published
status: draft
---

# Deployment and delivery - learn.cogitave.com

> The end-to-end path from a commit to the served surface: **CI -> build ->
> promote -> deploy to Cloudflare Pages -> serve**. It mirrors the estate CD
> standard ([deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md),
> [ADR-0017](../../standards/docs/decisions/0017-devops-cicd-and-deployment.md)).

> [!IMPORTANT]
> **What learn is - and is not.** `learn.cogitave.com` is a **free, public**
> static site plus an MCP edge function, served **directly by Cloudflare Pages**.
> It is *not* behind the cogitave-cloud gateway, and it has **no membership, no
> auth, no request fence, and no metering**. Those belong to a **different**
> surface - the managed **Cloud** product (governed Cogitave Core access at
> `mcp.cogitave.com`), documented in
> [cloud](../../standards/docs/architecture/products/cloud.md) and
> [editions.yaml](../../corp/gtm/pricing/editions.yaml). This document covers only
> how the learn site and its own MCP ship; it does not describe that product.

> [!NOTE]
> **Human-gated.** `merge` / `apply` / `release` / `deploy` are the always-human
> verb ceiling ([AGENTS.md](../../../AGENTS.md) rules 6-7): an agent authors the
> pipeline; a human runs it. The `production` Environment in
> [`deploy.yaml`](../.github/workflows/deploy.yaml) requires a human reviewer, and
> the publish job fails closed until approved, so a green run is never a false
> "deployed".

## 1. CI - the pull-request gate

[`.github/workflows/ci.yaml`](../.github/workflows/ci.yaml) runs on every PR to
`main`:

- **Build + validate** (`node tools/build.mjs`) - enforces every implemented gate
  (schema, metadata-required, unit-membership, achievement-resolves,
  broken-link/xref, broken-bookmark, render-fidelity, and partial quiz-shape). A
  failing gate fails the PR. See [build-v0](build-v0.md) for exactly what is and
  is not enforced.
- **MCP smoke** - drives `tools/mcp/server.mjs` against the freshly emitted
  `_api/` projection and asserts it answers `server/discover` on the pinned
  protocol revision.

The marketplace plugin has its own gate
([`cogitave-ai/plugins/.github/workflows/validate.yaml`](../../../cogitave-ai/plugins/.github/workflows/validate.yaml)):
manifest, every `plugin.json`/`.mcp.json`, and every skill's frontmatter.

> The file extension is `.yaml`, not `.yml`, on purpose: `estate-lint`'s
> `check_learnpr` matches any `.yml` under a "learn" path and demands a
> `### YamlMime:` first line (see [build-v0](build-v0.md)).

## 2. What the build emits

One build produces every surface from one typed model (no drift):

| Artifact | For |
|---|---|
| `_site/` | the human-facing HTML site (with content-hashed CSS/JS) |
| `_api/` (`{uid}.json` + `{uid}.md` + `index.json`) | the JSON and raw-markdown content API |
| `functions/mcp.js` (Streamable HTTP) | the agent-native surface; reads `_api/`, so it cannot drift from the site |
| `llms.txt` / `llms-full.txt` | the LLM index |
| `sitemap.xml`, `robots.txt`, `_headers`, `404.html`, `_redirects` | crawler, header, and not-found policy |

## 3. Environments and promotion

`dev -> staging -> prod`, promotion-gated, per
[deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md).
**No agent self-promotes to prod.** Each promotion is a GitHub Environment with
protection: `production` requires a human reviewer + a wait timer. That gate *is*
the merge/apply/release ceiling, enforced by construction.

## 4. Deploy - Cloudflare Pages

[`.github/workflows/deploy.yaml`](../.github/workflows/deploy.yaml) builds the
publishable bundle and uploads it, then a **human-gated `publish` job** (bound to
the `staging`/`production` Environment) ships it to **Cloudflare Pages** with
`cloudflare/wrangler-action` (`pages deploy _site --project-name=<project>`).
This is **Direct Upload**, not the Cloudflare Git integration: the build runs in
our own pipeline and we upload the artifact, so no third party gets a repo grant
and the supply chain stays ours.

A **health gate** then asserts, against the same upload, that the homepage returns
`200` and that `/mcp` both answers `server/discover` and still *enforces* the
transport (a header-less request is refused), before the run is allowed to go
green. A deploy that serves a broken `/mcp` is a failed deploy.

## 5. How the MCP is served

`learn.cogitave.com/mcp` is served **directly by the Cloudflare Pages Function**
[`functions/mcp.js`](../functions/mcp.js), which imports the same
`tools/mcp/protocol.mjs` the stdio server uses and reads the emitted `_api/`
corpus - so the hosted MCP cannot drift from the site. It accepts the current
2025-11-25 handshake and the newer stateless 2026-07-28, is **public and
unauthenticated**, and has no rate fence.
There is no gateway hop: the edge function *is* the endpoint.

> The estate's **managed Core** MCP (`mcp.cogitave.com`, governed, authenticated,
> metered) is a *separate product* served behind the cogitave-cloud gateway, with
> its own membership and free-tier fence. It is not learn and is not covered here;
> see [cloud](../../standards/docs/architecture/products/cloud.md) and
> [editions.yaml](../../corp/gtm/pricing/editions.yaml). The `cogitave-estate` and
> `cogitave-flow` plugins point at *that* endpoint; the `cogitave-learn` plugin
> points at the public learn MCP described above.

## Turning it on and off (the kill-switch)

[agentic-operations](../../standards/docs/standards/agentic-operations.md) section 6
requires every service to be **independently disable-able in one action**, and
disablement to be a **logged event**. The learn MCP has that at three levels:

| Level | How to disable | Effect | Reversible |
|---|---|---|---|
| **Local / self-host** | `COGITAVE_LEARN_MCP_ENABLED=false` (or the `--disabled` flag) at start | server starts but every data method returns a `-32001 "disabled"` error; HTTP returns `503`; `server/discover` still answers so a probe learns it is intentionally down | restart with the flag off |
| **Local / self-host, live** | create the file at `COGITAVE_LEARN_MCP_KILLFILE` (`touch`) | same, but flips **without a restart** - the server checks the file per request | `rm` the file |
| **Production** | delete the deployment or disable the `/mcp` Function/route in the Cloudflare Pages project | the hosted endpoint is off at the edge, before any code runs | redeploy / re-enable the route |

The production switch is the **authoritative** one (the edge is the trust boundary
and where disablement is evidenced); the server-level switch is the self-host /
local control and the backstop. All three are one action.

## Testing the live system before it ships

You test the real thing on your side, three ways, cheapest first:

1. **Local** - `node tools/build.mjs` then `npm run mcp` (stdio) or `npm run mcp:http`
   runs the **real** MCP server against the **real** built corpus. This is the same
   code that serves production; no account, no gateway.
2. **Staging** - `deploy.yaml` with `environment: staging` publishes to the staging
   Pages branch and runs the same health gate, gated by a human approval, before
   prod.
3. **Production** - promoted through the `production` Environment (required
   reviewers + wait timer), with the health gate + change evidence, per
   [deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md).

## 6. Releasing the plugin

The `cogitave-learn` plugin (and its siblings) are OSS in the marketplace. Day-0
versioning is the **git SHA** a consumer pins; semver moves to the
`cogitave-ai/registry` later (see the
[marketplace README](../../../cogitave-ai/plugins/README.md)). There is no npm
package to publish - the plugin is thin config + skills.

## 7. What stays human-gated (the honest list)

An agent authored the pipeline; a **human** does each of these:

- Approve each environment promotion (`staging`, then `production`).
- Rotate/issue production secrets (the Cloudflare API token, the OIDC deploy role).
- Any change to the Cloudflare Pages project settings (custom domain, routes).

## See also

- [build-v0](build-v0.md) - what the build does today and every deviation.
- [engine-architecture](engine-architecture.md) - how the build validates and serves.
- [deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md) · [ci-cd-pipelines](../../standards/docs/standards/ci-cd-pipelines.md)
- For the managed Cloud product (gateway, membership, metering) - a different surface from learn: [cloud](../../standards/docs/architecture/products/cloud.md) · [editions.yaml](../../corp/gtm/pricing/editions.yaml)
