Most teams treat a test as a courtesy - something you add if there is time. An
AI-native org does not: a test is **release-blocking evidence**, so an agent or a
human advances a change from `review` to `done` only when the test gates pass, and
a missing test is a missing piece of the Definition of Done, not a nice-to-have.

Two standards own this together, and they are separated on purpose:

- The [Testing & Quality Standard](../../../../standards/docs/standards/testing-quality.md)
  is the **policy** - what is required: the test-shape stance, which test types
  are mandatory on which surface, the coverage thresholds, the mutation gate, and
  the flaky-test quarantine rules.
- The [Test Harness Reference](../../../../standards/docs/standards/test-harness.md)
  is the **runnable** side - the per-language tool matrix, the exact commands, and
  the map from each CI gate to its Definition-of-Done item.

Alongside them sits the
[Code Craftsmanship Standard](../../../../standards/docs/standards/code-craftsmanship.md),
which is the **quality bar review enforces**: SOLID, KISS, YAGNI, and DRY are not
posters on a wall here - they are review criteria and eval-gate criteria, applied
to code that humans write and to code that agents generate.

> [!IMPORTANT]
> Read policy from the standard, wire it up from the harness. Never paraphrase a
> threshold from memory when the source is one link away - the numbers are the
> gate.

## Why this matters for you

You are working inside a control plane, where every change is auditable evidence.
The point of this module is not to admire the rules but to let you **test your own
change and pass the quality gate**: pick the right test tier, hit the diff-coverage
gate, keep the suite deterministic, and write code a reviewer will not send back.

## What you will be able to do

- State the test-shape stance and the rule that overrides the ratios.
- Name what makes coverage a floor, not a goal - and why diff coverage is the gate.
- Use the harness to run the right tier, and read the gate-to-DoD map.
- Pass the craftsmanship review bar without applying any principle dogmatically.
