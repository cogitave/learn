You now have a working command of the patterns catalog: what it is, how to read
an entry, and the loop that gets you from "I need to do X" to "I am extending a
named artifact."

In this module, you:

- Saw the gap the catalog closes: reuse-first stated the principle, and a
  patterns catalog is the artifact that turns it into a one-hop answer to
  "how does your org do X", recorded for Cogitave in ADR-0022.
- Read the **five-section entry shape** - Problem, The canonical way, Governing
  standard(s), Reusable artifact, Anti-pattern - in both the human doc and the
  machine-readable `catalog.yaml`, and saw several task-level intents share
  one `canonical_pattern` doc.
- Learned that **the authority always lives in the governing standard** - a
  pattern that disagrees with its standard is a bug, never the other way round.
- Ran the **four-step discover-before-you-build loop**: query before you
  generate, read the entry and follow its two links, start from the named
  artifact, and - if you must go off-road - record the rationale, own the
  maintenance, and still satisfy the Definition of Done.

## Next steps

- @cogitave.learn.inherit-the-project-baseline - how a repo scaffolded from a
  pattern's reusable artifact inherits the floor, the standards, the lifecycle,
  and the identity automatically.
- The **patterns catalog**, in your estate's standards repository, is the
  source - go back and query it for your next real task.
- Cogitave's **ADR-0022** is the decision record behind both the catalog and the
  project baseline.
