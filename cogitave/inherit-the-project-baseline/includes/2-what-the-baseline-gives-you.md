A repo does not inherit one thing — it inherits along several distinct **planes**,
each with its own mechanism. A single **project baseline** contract names them
together so a project sees the whole — Cogitave's
[project baseline](../../../../standards/docs/standards/project-baseline.md) is one
such contract.

## The floor is inherited for free — and can only be added to

Every repo inherits the org's root [`AGENTS.md`](../../../../../AGENTS.md) — the
non-negotiable floor — the moment it exists, because `AGENTS.md` is cumulative
with nearest-file precedence. A leaf repo's `AGENTS.md` **adds** project specifics
and **must not restate** the floor. A floor is a small org-wide ruleset every
human and agent obeys, defined once at the root. Cogitave's floor, for instance,
is seven non-negotiables (English only; Conventional Commits; signed/`Verified`
commits; docs-as-code; least-privilege default-deny; no unapproved mutation of the
world; human-in-the-loop on consequence).

> [!IMPORTANT]
> A new repo does **not** re-declare any of this. Inheriting the floor is free;
> overriding it is impossible — a leaf file can only add.

## Standards apply in two tiers

- **Always-on** standards are inherited unconditionally by every repo, whatever it
  is; in Cogitave's estate these are documentation and diagrams, commits-versioning
  and the pre-commit hook, naming, testing-quality, CI/CD, the security spine,
  configuration, observability, reliability, and the reuse-first operating model
  (next unit).
- **Conditional** standards are switched on by the repo's **product type**. The
  type is not a one-off form: it also decides which conditional Definition-of-Done
  gates fire. Product type → applicable standards → conditional gates is one
  coherent chain.

| If the repo is a … | It additionally inherits (examples) |
| --- | --- |
| SaaS / hosted service | saas, deployment-and-delivery, [product-core-baseline](../../../../standards/docs/standards/product-core-baseline.md) |
| API / platform surface | api-design, api-versioning-and-deprecation, [product-core-baseline](../../../../standards/docs/standards/product-core-baseline.md) |
| Frontend / has a UI | design-system, accessibility, internationalization |
| Agent | ai-agent-engineering, agentic-operations |

For example, a service or API core additionally signs the
[product-core-baseline](../../../../standards/docs/standards/product-core-baseline.md)
contract — the cross-cutting capabilities (typed errors, config, health probes,
authz, idempotency, and more) it MUST implement before it serves a request.

## The scaffold bakes it in from birth

A repo is **born** with the ruleset baked in — it does not assemble its own
toolchain. It is created by copying a **base template** and then layering the
per-type template. In Cogitave's estate, `templates/base` ships the
`AGENTS.md`/`CLAUDE.md` stub, a reproducible toolchain (`.mise.toml`, `justfile`,
`.devcontainer/`), the quality gate that CI also runs (`lefthook.yml`,
`commitlint.config.js`, `.gitleaks.toml`), CI/CD wiring with `CODEOWNERS`, and a
`.claude/settings.json` that pins the published `cogitave-flow` and
`cogitave-estate` plugins. Skills are single-sourced in the plugins repo; a repo
only **consumes** them.

## The lifecycle and Definition of Done it runs under

Every change moves through the 7-stage request lifecycle
(intake → evaluate → plan → document → implement → review → done), which does not
invent policy — it **sequences the floor**. Stage 6 enforces the Definition of
Done: a change advances to *done* only when the machine gate reaches 100% **and** a
CODEOWNER approves — the machine gate and the human gate are separate.
