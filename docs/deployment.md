---
uid: cogitave.learn.docs.deployment
title: Deployment, delivery, and membership - learn.cogitave.com
description: How learn.cogitave.com and the cogitave-learn plugin are built, validated, promoted, deployed, and served behind the cogitave-cloud gateway; where the free-tier fence is enforced; and which steps stay human-gated at Day 0.
type: how-to
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - cogitave-core
roles:
  - developer
  - platform-engineer
level: intermediate
visibility: internal   # engineering document: stays in git, not published
status: draft
---

# Deployment, delivery, and membership - learn.cogitave.com

> The end-to-end path from a commit to a served, metered surface: **CI ->
> build -> promote -> deploy -> serve behind the gateway -> meter/bill**, plus how
> membership works and where the free-tier fence is enforced. It mirrors the
> estate CD standard ([deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md),
> [ADR-0017](../../standards/docs/decisions/0017-devops-cicd-and-deployment.md)) and the
> hosted-plane architecture ([cloud](../../standards/docs/architecture/products/cloud.md)).

> [!IMPORTANT]
> **Day-0 honesty.** Nothing here is enacted yet. The estate has not been pushed;
> no CI has run, no site is deployed, no gateway is live. These workflows and this
> spec are **scaffolds a human enacts**. Per [AGENTS.md](../../../AGENTS.md) rules
> 6-7, `merge` / `apply` / `release` / `deploy` are the **always-human** verb
> ceiling: an agent authors the pipeline; a human runs it. The publish step of
> [`deploy.yaml`](../.github/workflows/deploy.yaml) fails closed until its target
> is wired, so a green run is never a false "deployed".

## 1. CI - the pull-request gate

[`.github/workflows/ci.yaml`](../.github/workflows/ci.yaml) runs on every PR to
`main`:

- **Build + validate** (`node tools/build.mjs`) - enforces every implemented gate
  (schema, metadata-required, unit-membership, achievement-resolves, quiz-shape,
  and include/snippet resolution). A failing gate fails the PR.
- **MCP smoke** - starts `tools/mcp/server.mjs` against the freshly emitted
  `_api/` projection and asserts it serves the corpus.

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
| `_site/` | the human-facing HTML site |
| `_api/` (`{uid}.json` + `index.json`) | the JSON content API |
| MCP over stdio / Streamable HTTP (`tools/mcp/server.mjs`) | the agent-native surface; reads `_api/`, so it cannot drift from the site |
| `llms.txt` / `llms-full.txt` | the LLM index |

## 3. Environments and promotion

`dev -> staging -> prod`, promotion-gated, per
[deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md).
**No agent self-promotes to prod.** Each promotion is a GitHub Environment with
protection: `production` requires a human reviewer + a wait timer. That gate *is*
the merge/apply/release ceiling, enforced by construction.

## 4. Deploy

[`.github/workflows/deploy.yaml`](../.github/workflows/deploy.yaml) builds the
publishable bundle and uploads it, then a **human-gated `publish` job** (bound to
the `staging`/`production` Environment) ships it. GitOps (Argo CD / Flux
pull-reconcile) is the estate default delivery model; this push-flow is the
fallback and the uniform place the health gate + change-management evidence live
(ADR-0017).

**The publish target is a cutover decision** ([build-v0](build-v0.md): no publish
path is wired yet). At cutover, the `publish` step syncs `_site/` to the chosen
static edge and serves the `_api/` projection behind the gateway (section 5).

## 5. Serving the MCP behind the cogitave-cloud gateway

The agent-native surface (the same one the `cogitave-learn` plugin's `.mcp.json`
points at, `https://mcp.cogitave.com/mcp`) is served through the
[cogitave-cloud](../../standards/docs/architecture/products/cloud.md) **edge
gateway** (Envoy/Kong, `ext_authz`). The gateway, once, fail-closed:

1. **Authenticates** the caller - `COGITAVE_API_KEY` at Day 0; OAuth 2.1
   Resource-Server scopes are the target (MCP spec 2026-07-28).
2. **Resolves the tenant** and propagates the context immutably.
3. **Enforces the entitlement + rate limit** - this is where the free-tier fence
   (section 6) lives. Tenants, entitlements, and evidence are **Cogitave Core
   graph facts**, not a bespoke admin DB.

Local agents may instead run Core / the learn MCP as a **stdio** server in-estate
with no gateway - which is exactly how the team develops (section 6).

## 6. Membership and the free-tier fence

Self-serve, product-led ([PLG ADR](../../corp/gtm/decisions/0002-plg-with-sales-assist-motion.md)):

1. **Sign up** -> the control plane provisions a tenant
   (`provisioning -> active -> ...`) and issues a key. No card for the free tier.
2. **Use** -> calls hit the gateway, which enforces the tenant's entitlement.
3. **Bill** -> event-sourced metering on Core -> PSP (Stripe/Adyen); usage is
   visible before the bill; caps protect free-tier users from overage.

The fence, from [editions.yaml](../../corp/gtm/pricing/editions.yaml) (the source
of truth; billing and the pricing page are downstream projections):

| Tier | Governed requests | How |
|---|---|---|
| **Community** (self-host) | **unlimited** | your own compute; open-core never caps the core dev experience |
| **Cloud free** (managed) | **25 / month** | gateway entitlement, no card |
| **Cloud / Enterprise** (paid) | **unlimited** | metered (pay-as-you-go), never blocked |

> [!NOTE]
> **Does the team hit 25?** No. That cap is only the *hosted managed free tier*,
> enforced at the gateway when the Cloud is live. The team develops against the
> **self-host Community edition (unlimited)** or the **local build + local MCP
> server** - no gateway, no cap. The 25-request fence never touches self-hosted or
> local usage.

## Turning it on and off (the kill-switch)

[agentic-operations](../../standards/docs/standards/agentic-operations.md) section 6
requires every service to be **independently disable-able in one action**, and
disablement to be a **logged event**. The learn MCP has that at three levels,
from local to production:

| Level | How to disable | Effect | Reversible |
|---|---|---|---|
| **Local / self-host** | `COGITAVE_LEARN_MCP_ENABLED=false` (or the `--disabled` flag) at start | server starts but every data method returns a `-32001 "disabled"` error; HTTP returns `503`; on stdio `server/discover` still answers so a probe learns it is intentionally down | restart with the flag off |
| **Local / self-host, live** | create the file at `COGITAVE_LEARN_MCP_KILLFILE` (`touch`) | same, but flips **without a restart** - the server checks the file per request | `rm` the file |
| **Production** | the **cogitave-cloud gateway** disables the `/mcp` route (and/or an OpenFeature kill-switch flag) | the hosted endpoint is off for everyone or per-tenant, at the edge, before any backend is hit | re-enable the route/flag |

The production kill-switch is the **authoritative** one (the gateway is the trust
boundary and where disablement is evidenced); the server-level switch is the
self-host / local control and the backstop. All three are one action.

## Testing the live system before it ships

Yes - you test the real thing on your side, three ways, cheapest first:

1. **Local** - `node tools/build.mjs` then `npm run mcp` (stdio) or `npm run mcp:http`
   runs the **real** MCP server against the **real** built corpus. This is the same
   code that serves production; no account, no cap, no gateway.
2. **Staging** - `deploy.yaml` with `environment: staging` publishes to the staging
   edge behind the gateway - the full path (auth, tenant, entitlement, metering)
   against real infra, gated by a human approval, before prod.
3. **Production** - promoted from staging through the `production` Environment
   (required reviewers + wait timer). Progressive delivery (canary) + a health gate
   + auto-rollback, per [deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md).

## 7. Releasing the plugin

The `cogitave-learn` plugin (and its siblings) are OSS in the marketplace. Day-0
versioning is the **git SHA** a consumer pins; semver moves to the
`cogitave-ai/registry` later (see the
[marketplace README](../../../cogitave-ai/plugins/README.md)). There is no npm
package to publish - the plugin is thin config + skills; the intelligence is in
Core.

## 8. What stays human-gated (the honest list)

An agent authored everything above; a **human** does each of these:

- `git push` the estate to GitHub (Day 0: not yet pushed).
- Approve each environment promotion (`staging`, then `production`).
- Wire the real publish target + the gateway route at cutover (replace the
  fail-closed placeholder in `deploy.yaml`).
- Stand up the control plane, gateway, metering, and PSP (cloud.md: "no
  implementation in this phase; only the gateway repo exists yet").
- Rotate/issue production secrets and the OIDC deploy role.

## See also

- [build-v0](build-v0.md) - what the build does today and every deviation.
- [engine-architecture](engine-architecture.md) - how the build validates and serves.
- [deployment-and-delivery](../../standards/docs/standards/deployment-and-delivery.md) · [ci-cd-pipelines](../../standards/docs/standards/ci-cd-pipelines.md) · [cloud](../../standards/docs/architecture/products/cloud.md) · [saas](../../standards/docs/standards/saas.md)
