A green pipeline produces a **signed artifact**. The
[deployment-and-delivery standard](../../../../standards/docs/standards/deployment-and-delivery.md)
governs the **outer loop** - how that artifact becomes a running workload. This
is where a deploy becomes auditable change evidence.

## One artifact, promoted forward

An AI-native org runs a **linear promotion pipeline** plus ephemeral preview
environments per pull request. Cogitave's own path, for instance, is `dev` to
`staging` to `prod`:

- **preview** - ephemeral, per-PR, auto spun-up and auto torn-down on PR close;
  data-isolated (never prod data).
- **dev** - promotes from `main` on merge, automatically.
- **staging** - persistent and prod-like; the release candidate lands here,
  gated on smoke and integration green.
- **prod** - promotes from `staging` by **manual** promote, behind a human
  approval gate.

Two rules make this trustworthy. Promotion is **forward-only and monotone**: an
artifact reaches `prod` only after it was observed healthy in `staging`. And you
promote the **same signed digest** across every environment - never rebuild per
environment, because a rebuilt binary is a different, unverified artifact. Only
config and feature flags differ between environments; the artifact is identical.

## GitOps: pull-based, not pushed

The default delivery mechanism is **GitOps**. Git is the single source of
desired state, and an in-cluster reconciler (the Argo CD or Flux class) **pulls**
that state and converges the cluster to it. CI does **not** run `kubectl apply`
or push to a cluster. Promotion is a commit to the environment overlay, pinned by
immutable digest, and the reconciler applies it. This means **no long-lived
cluster credentials live in CI** - the promotion job mints a short-lived, scoped
token to commit desired state; the cluster credential lives only with the
reconciler.

## Progressive delivery and rollback

The standard's recommended progressive rollout is **canary**: the progressive-delivery controller shifts
traffic in graduated steps (for example 5%, 25%, 50%, 100%) and **promotes or
aborts on SLO metrics** - error rate and p99 latency against the service's SLO -
not on a human eyeballing a dashboard. A window that breaches the threshold
triggers an **automatic rollback**; the controller owns the abort path, and it
keeps working even if CI is offline. Every deployment must be reversible, and
every service must ship a **rollback runbook** - a service without one is not
production-ready.

> [!IMPORTANT]
> **Deploy is not release.** New behavior ships **dark** behind a feature flag
> and is released by flipping the flag, not by redeploying. A kill-switch flag
> needs no deployment, so canary (infrastructure) and flags (application) can
> each roll back independently.

## The prod gate is a human, and it fails closed

Two gates stand before production. First, the deploy **verifies the signature and
provenance** of the artifact; an unsigned or unverifiable digest **fails closed**
and cannot be promoted. Second, `prod` is a protected environment: at least one
required reviewer, a wait timer, prevent-self-review, and **admin bypass
disabled**. The identity that authored or merged a change must not be the sole
identity that approves its prod deploy - separation of duties. As ADR 0017 and
the AGENTS floor state, **an agent never self-approves promotion to prod**; agents
and CI propose, a human enacts. Every deployment is recorded as immutable change
evidence bound to the digest, the approver, the environment, and the outcome.
