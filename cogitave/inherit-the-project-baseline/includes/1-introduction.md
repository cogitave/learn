A new repository should never have to ask "what are the rules here?". In most
organisations it does, and every repo answers a little differently — one wires its
own CI, another skips signed commits, a third invents its own error shape. The
drift is the cost.

An AI-native org removes the question. A new project is **born on the paved
road**: the floor applies, the standards apply, the scaffold is already in place,
the lifecycle is wired, the org's identity is embodied, and the patterns catalog
already answers most "how do I do X" questions. The single document that states
this complete inherited ruleset is the **project baseline** — the inheritance
contract. It **references** each source of truth rather than restating it, and
where the contract and a linked authority disagree, the authority wins.

Cogitave's own estate is the worked example this module uses: its
[project baseline](../../../../standards/docs/standards/project-baseline.md) is
one such contract, and every repo it births inherits from it. This module is
about that inheritance: what a repo gets for free, how the scaffold bakes it in
from birth, and the one habit that keeps you on the road — **discover before you
build**.

## What you will be able to do

- Explain how a repo inherits its whole ruleset automatically, instead of
  re-deciding it.
- Scaffold a repo so the baseline is present from the first commit.
- Tell an always-on standard from one a product type pulls in.
- Find an existing pattern before you generate new code.

> [!IMPORTANT]
> **Day-0 honesty.** In Cogitave's own estate — the worked example — nothing has
> shipped to GitHub yet. The inheritance mechanisms shown here are authored specs
> and scaffolds; the CI gates, the org ruleset, and the Core scorecard become
> *enforced* at cutover, not before. What is real **today** is the contract — a
> repo that follows it is conformant by construction. This module states that
> plainly rather than implying the gates are already live.
