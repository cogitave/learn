You can now walk the incident-response flow and see how it scales up into
business continuity when a disruption is bigger than one incident.

In this module, you:

- Learned the **NIST 800-61r3 / CSF 2.0** lifecycle behind the
  incident-response plan: continuous **Govern/Identify/Protect** readiness
  feeding live **Detect/Respond/Recover**, closed by **Learn**.
- Applied the single **S1-S4 severity scale**, the
  **declare-high-downgrade-later** principle, and the **security override**
  that always routes a security-relevant signal onto its own path regardless of
  apparent severity.
- Named the **single-commander** roles and the one rule that never bends: the
  Incident Commander never debugs hands-on and is never the same person as a
  responder.
- Saw how a **runbook** contains an incident class before it diagnoses, and how
  every S1/S2 closes with a **blameless postmortem** that feeds fixes back into
  readiness.
- Traced the business-continuity chain - **BIA -> service tiers -> backup
  strategy and DR plan -> exercises -> WORM evidence** - and the dependency
  order (identity, then secrets/PKI, then gateway and Core) the estate recovers
  in when more than one service is down.

## Next steps

- @cogitave.learn.operate-from-day-1 - the next module in **Operate the
  estate**, on the inner and outer loop that ships a change day to day.
- The **`ops/README.md`** doc, in the estate's ops tree, is the entry point to
  both trees; return there whenever you need to find the next document rather
  than paraphrasing it from memory.
- The **incident-response plan** is the canonical source for the full
  lifecycle and the compliance mapping (ISO 27001 A.5.24-A.5.28, SOC 2
  CC7.3-CC7.5).
- The **bcp** and **dr-plan** docs are the business and technical halves of
  business continuity, kept live by the **test-and-exercise program**, all in
  the same ops tree.
