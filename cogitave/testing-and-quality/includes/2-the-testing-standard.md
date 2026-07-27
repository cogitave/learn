The [Testing & Quality Standard](../../../../standards/docs/standards/testing-quality.md)
is policy: it says *what* is required, and it opens with three non-negotiable
principles. A behavior change is incomplete without a test **and** a doc change;
**a flaky test is a bug**, never "just retry"; and **determinism is a property of
the suite** - same input, same result, on any machine, in any order.

## Test shape follows the layer

Cogitave does not mandate one shape across the stack; the shape follows the
failure modes of the layer.

- **Backend / hot path (Rust, Go) - a pyramid.** Roughly unit ~70%, integration
  ~20%, end-to-end ~10%, as an order-of-magnitude guide, not a quota.
- **Frontend / edge (TypeScript) - a trophy.** The integration tier (component +
  interaction, real DOM, mocked network) catches the most regressions per unit of
  maintenance, so emphasis runs integration > unit ~= e2e > static.

> [!IMPORTANT]
> The rule that overrides the ratios: **test at the lowest tier that can observe
> the behavior.** A bug provable by a unit test must not require an e2e test.
> Ratios are a smell detector, never a target - do not write tests to hit a
> percentage.

## Required types, by surface

Not every type applies to every repo. Unit tests are **always** mandatory.
Integration is mandatory once a repo crosses a real boundary (DB, network, FFI,
transport), because adapters lie and types do not catch wire drift. Property-based
tests are required on core logic (parsers, encoders, query planners, auth checks);
fuzz tests on untrusted-input attack surfaces such as `yuva`, `namzu`, and
protocol decoders; contract tests on any boundary with an independent consumer;
and evals on any agent-behavior change.

## Coverage is a floor and a trend, never a goal

High line coverage with weak assertions is theater. The thresholds are per-file
70%, per-package 80%, and repo 90% target / 85% hard floor - but the **blocking
gate is patch (diff) coverage: 90% of changed lines**. That is what makes the gate
fair on legacy code and strict on new code, plus a no-regression ratchet on the
repo total. Watch the documented pitfalls: coverage is not correctness, coverage
farming (tests that touch lines without asserting) is review-rejectable, and
exclusions must be checked-in, commented ignore rules - never a silent CI flag.

## Mutation testing is the real adequacy gate

For modules flagged `tier: critical` (hot paths, auth, Core logic), line coverage
is necessary but not sufficient. Mutation testing perturbs the code - flips a `<`,
drops a `+ 1` - and asserts the suite **fails**; a surviving mutant is an untested
assertion. The threshold is **>= 80% of mutants killed** on the critical set
before merge.

## A flaky test is quarantined, not tolerated

When CI detects a test that passes and fails on the same commit, it is
**quarantined immediately** - it still runs and reports but does not block merge -
and a defect is filed with an owner and a default **7-day deadline**. Past the
deadline, the quarantine blocks the owning team's merges. Blanket retries may
*detect* flakiness; they may never be the *remedy*.
