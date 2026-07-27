Knowing the policy is half the job. To test a change you also need the *runnable*
side and the *review* bar it has to survive.

## The harness: same commands locally and in CI

The [Test Harness Reference](../../../../standards/docs/standards/test-harness.md)
pins the tooling so nothing floats. The runners are `cargo nextest` (Rust),
`gotestsum` over `go test` (Go), and `vitest` (TypeScript); coverage is
`cargo-llvm-cov`, `go test -coverprofile`, and `vitest --coverage`; mutation is
`cargo-mutants`, `gremlins`, and `stryker` - run on critical modules only, because
it is expensive.

The loop is split so feedback stays fast:

- **Inner loop** (seconds, on save): watch-driven unit and property tests for the
  module you are editing - no coverage, no gate.
- **Outer loop** (CI, minutes): the full tiered suite plus every gate.
- **Pre-commit** (lefthook): **format and lint only - no test execution.** Tests
  belong in CI; the hook stays under a few seconds.

> [!NOTE]
> The lefthook hook runs the same lint and format commands as CI for convenience,
> but **CI is the real gate** - there is no "works on my machine" escape.

## The gate-to-DoD map

Each required CI check is the operational form of a
[Definition of Done](../../../../standards/docs/standards/testing-quality.md#10-the-gates-and-how-they-map-to-the-dod)
item: `test` and `coverage` and `mutation` satisfy `C2`; `perf` satisfies `P1`;
`fuzz` satisfies `S1`/`S2`; `evals` satisfy `C3`; `docs-required` satisfies `C4`;
`secret-scan` satisfies `C9`. Green across the applicable gates is **necessary but
not sufficient** - `done` still requires a CODEOWNER approval, because the machine
gate and the human gate are separate by design (separation of duties).

## The quality bar review enforces

Passing the test gates is not the same as passing review. The
[Code Craftsmanship Standard](../../../../standards/docs/standards/code-craftsmanship.md)
turns design principles into **review and eval-gate criteria**: a change that
violates them is a change request, not a style nit. The highest-leverage form is
**correctness by construction** - make illegal states unrepresentable and
*parse, don't validate*, so the compiler carries the invariant instead of a
runtime re-check. That is the same autonomy rail the root
[`AGENTS.md`](../../../../../AGENTS.md) names: a narrow agent can act unattended
because typed inputs and outputs hold.

The simplicity principles are the counterweight to over-engineering: **KISS**
(the simplest design that expresses the invariant wins), **YAGNI** (do not build
for a future that has not arrived), and **DRY as knowledge, not text** - unifying
code that merely *looks* alike but encodes *different* knowledge is coincidental
duplication, and collapsing it produces the wrong abstraction.

> [!IMPORTANT]
> **Dogmatic application of these principles is itself an anti-pattern.** They are
> heuristics with costs, not laws. Demanding an interface for a single
> implementation, or extracting two-line lookalikes, *causes* the damage the
> principles exist to prevent. The default: choose the simplest thing that makes
> the invariant hold and is not yet duplicated a third time - add abstraction on
> evidence of a real second case, never on anticipation.
