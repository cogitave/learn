"How does your org do X?" can go without a single answer for a long time. The
reuse-first principle - discover before you generate - may already be stated as a
hard rule, but an agent facing "stand up a REST service" still has to reconstruct
the golden path by hand: which standard governs it, which template to start from,
which anti-pattern to avoid. Reconstructing that path every time, inconsistently,
is exactly the divergence the reuse-first rule exists to kill, one layer up.

A [patterns catalog](../../../../standards/docs/patterns/README.md) is the
artifact that closes that gap. For every recurring build task it names the
**one** sanctioned way to solve it and points at the authority that
owns the rules. It is the paved road, made queryable in one hop instead of
re-derived across dozens of standards.

> [!IMPORTANT]
> The catalog does not invent policy and it does not restate standards. Every
> entry is a thin, honest pointer - the authority always lives in the standard
> it cites. If you remember one sentence from this module, make it that one.

This module builds on the first module in this path,
@cogitave.learn.reuse-first-engineering, which taught **why** discover-before-generate
is the rule. This module teaches **how** to act on it: reading a catalog entry,
using the machine-readable index behind it, and running the loop that takes you
from "I need to do X" to "I am extending a named artifact." Cogitave's decision to
add both artifacts is recorded in
[ADR-0022](../../../../standards/docs/decisions/0022-patterns-catalog-and-project-inheritance.md).

## What you will get from this module

By the end you will be able to explain what the catalog is for, read any entry's
five fixed sections without confusing the pointer for the policy, find the
pattern for a task and follow its two links - the governing standard and the
reusable artifact - and run the four-step discover-before-you-build loop,
including the honest path for when nothing fits.
