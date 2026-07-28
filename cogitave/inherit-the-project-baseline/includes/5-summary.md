You saw that a Cogitave repo never has to ask "what are the rules here?" — it is
born on the paved road with its complete ruleset already inherited.

In this module, you:

- Learned that a repo inherits along distinct **planes** — the floor, the
  standards, the scaffold, the lifecycle and Definition of Done, and the identity —
  each with its own mechanism, stated once in the project baseline.
- Saw the **floor is inherited for free** and a leaf `AGENTS.md` can only add,
  never restate or override it.
- Distinguished **always-on** standards from the **conditional** standards a
  product type pulls in — for example, a service signing the
  product-core-baseline contract.
- Learned that the **scaffold bakes it in from birth**: a repo is copied from
  `templates/base` plus its per-type template, so the toolchain, quality gate, and
  CI are present from the first commit.
- Adopted **discover before you build**: query the patterns catalog, start
  from the named artifact, and only author new after a recorded "no fit" —
  then contribute it back.

Remember the Day-0 honesty: these mechanisms are authored specs and scaffolds
today; the gates become enforced at cutover. What is real now is the contract.

## Next steps

Where you go next depends on your path:

- **Contributor onboarding** → @cogitave.learn.work-the-request-lifecycle - walk a
  change through the 7-stage lifecycle and Definition of Done you met here.
- **Patterns and golden paths** → @cogitave.learn.use-the-decision-guides - walk a
  technology-selection decision guide to a justified, standards-backed choice.
- The **project baseline** is the canonical standard, in the estate's
  standards repository, for the full inheritance contract and its
  conformance scorecard.
- The **patterns catalog** is the golden-paths index, in the same repository,
  to reach into before generating anything.
