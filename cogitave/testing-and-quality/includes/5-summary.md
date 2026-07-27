You can now test a change to Cogitave's standard and reason about the gate it must
pass.

In this module, you:

- Learned that a test is **release-blocking evidence**, and that policy lives in
  the [Testing & Quality Standard](../../../../standards/docs/standards/testing-quality.md)
  while the runnable side lives in the
  [Test Harness Reference](../../../../standards/docs/standards/test-harness.md).
- Saw that test shape follows the layer - a **pyramid** for the backend, a
  **trophy** for UI - under one overriding rule: **test at the lowest tier that
  can observe the behavior**.
- Named the coverage stance: coverage is a floor and a trend, **diff coverage
  (90% of changed lines) is the gate**, and **mutation testing (>= 80% killed)**
  is the real adequacy gate for `tier: critical` modules.
- Learned that a **flaky test is a bug** - quarantined with an owner and a 7-day
  deadline, never silenced with retries.
- Matched each CI gate to its Definition-of-Done item, and learned that green
  gates are necessary but not sufficient - a CODEOWNER still approves.
- Learned the craftsmanship review bar: **correctness by construction** first,
  simplicity as its counterweight, and that **dogmatic application is itself an
  anti-pattern**.

## Next steps

- [Testing & Quality Standard](../../../../standards/docs/standards/testing-quality.md) -
  re-read the policy at the source; the thresholds are the gate.
- [Test Harness Reference](../../../../standards/docs/standards/test-harness.md) -
  the exact commands and configs to wire the gates into a repo.
- [Code Craftsmanship Standard](../../../../standards/docs/standards/code-craftsmanship.md) -
  the full reviewer and eval checklist your change is measured against.
