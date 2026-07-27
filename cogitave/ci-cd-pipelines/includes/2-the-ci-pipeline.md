Every repository runs the **same ordered stage set** on every pull request and
on every push to `main`. The stages are **fail-fast**: a failed mandatory gate
stops the pipeline and blocks the merge. Read this as a pipeline you can trace,
not a black box.

## The canonical stage set

The
[CI/CD pipelines standard](../../../../standards/docs/standards/ci-cd-pipelines.md)
defines the ordered stages. In order, they run: checkout and pinned toolchain;
lockfile-honest install and cache; format check; lint; build; unit tests;
integration tests; the coverage gate; optional mutation testing; then the
security band - secret scan (gitleaks), SAST, SCA and license, SBOM and
provenance; then IaC scan, container scan, and artifact build and sign where the
project ships those surfaces; contract and E2E where a public contract exists;
`docs-required`; and, for control-plane and docs repos, estate-lint and
fact-drift.

You do not need every number in your head. You need the shape and the floor.

> [!IMPORTANT]
> The **mandatory floor on every pull request, for all project types**, is:
> checkout and toolchain, resolve and cache, format check, lint, build, unit
> tests, the coverage gate, the secret scan, SAST, SCA and license, and
> `docs-required`. Everything else is conditional on project type and risk
> class.

The stages that prove test quality (coverage, mutation) are owned by the
testing-quality standard; the security band (secret scan through sign) is owned
by the supply-chain standard. The pipeline standard does **not** restate their
numbers - it only mandates that each gate **runs and blocks**. When you need a
threshold, follow the pipeline to the owning standard rather than guessing.

## Why CI is the real gate

Your editor and the local hook run the same targets - the standard calls this
`lefthook == just == CI` parity, so a fast format-and-lint pass runs before you
push. That local run is a **mirror, not the gate**. ADR 0017 states it plainly:
**CI is the real gate; local hooks are only the fast mirror.** A hook can be
skipped, run on a stale tree, or differ from a teammate's machine. CI runs the
canonical, pinned stage set on the actual merge candidate, and its result is
recorded evidence.

CI is also the **machine half of the Definition of Done**. The request lifecycle
advances a change toward `done` only when the machine gates are green *and* a
human reviewer (a CODEOWNER) approves - the human half, separation of duties.
The pipeline supplies the evidence for the machine items: tests green, coverage
met, `docs-required` satisfied, no secrets, no new high or critical
vulnerabilities.

## Repos wire workflows, they do not fork them

Stage logic lives in **one** place: the org reusable workflows. A repository does
not hand-roll stage logic; it **calls** a reusable workflow and passes inputs
(the language, a coverage minimum, an environment). Two rules make this
auditable: every `uses:` is pinned to a full commit SHA, and every workflow
declares the **minimum** permissions - default `contents: read`, with write
scopes granted only to the one job that needs them. A change to a gate is then
one reviewed pull request for the whole estate, not a drift-prone edit in each
repo.
