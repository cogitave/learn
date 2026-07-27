The **inner loop** is how an engineer, or an agent, goes from a clean checkout to
a green PR: edit, build, test, repeat, measured in seconds. Its full contract is
[development-process](../../../../standards/docs/standards/development-process.md).
The load-bearing rule of that standard, stated once and never restated, is this:

```
lefthook commands  ==  CI commands  ==  just targets
```

## The reproducible, pinned toolchain

The toolchain is layered, floor to ceiling: **`dev-setup.sh`** bootstraps the
floor (installs `mise` itself plus host prerequisites); **`mise`** is the org's
pinned-toolchain layer - a single polyglot binary, versions committed in
`.mise.toml` so a laptop and a CI runner get the byte-identical toolchain; **`just`**
is the canonical task surface; a **devcontainer** is optional editor/LSP parity on
top of the first three. Every repo exposes the **same canonical target names** -
`build`, `test`, `lint`, `fmt`, `run`, `watch`, `bench`, `cov` - so muscle memory
and automation transfer across Rust, Go, and TypeScript repos. A repo may add
repo-specific recipes but **must not rename or omit** a canonical target.

## The parity contract

The pre-commit hook calls `just fmt --check` / `just lint`; CI calls the *same*
`just` targets; both resolve tools through the same `.mise.toml`. There is no
fourth, hand-written copy of any command anywhere. This is why "green locally, red
in CI" becomes a near-impossible state instead of a daily tax. The git hook is a
**convenience and is bypassable** (`--no-verify`); **CI is the real, unbypassable
gate**. If a check ever passes locally and fails in CI, that is not a flaky test -
it is a parity bug in this contract, and the fix is to close the gap, never to
relax CI to match.

## Trunk-based delivery and preview environments

`main` is protected; branches are short-lived; every change lands through a
mandatory PR with linear history. Long-lived feature branches are an
anti-pattern - incomplete work hides behind **feature flags**, not branches.
Small, frequent PRs are the single biggest lever on lead time and review latency.
Every PR produces a **deploy preview** on the same Terraform, secret pattern, and
observability stack as production - environment parity, not a bespoke snowflake.

## Measuring the loop honestly

**DORA** (deployment frequency, lead time for changes, change failure rate, MTTR)
and **SPACE** are read at team level, as trends - never to rank individuals and
never as a target to be gamed. A metric that becomes a target stops being a
metric, which is why the standard pairs a throughput signal with a quality one
(deployment frequency *with* change failure rate) and reviews the metric set
quarterly.

This inner loop is the loop the request-lifecycle's **implement** stage runs in:
a change leaves that stage only when `fmt --check`, `lint`, `test`, and the
coverage gate pass locally *and* in CI, the PR has a deploy preview, and the
lifecycle's own
[Definition of Done](../../../../agents/lifecycle/definition-of-done.md) is
satisfied.
