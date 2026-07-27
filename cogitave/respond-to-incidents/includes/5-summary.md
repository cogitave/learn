You can now walk the incident-response flow and see how it scales up into
business continuity when a disruption is bigger than one incident.

In this module, you:

- Learned the **NIST 800-61r3 / CSF 2.0** lifecycle behind the
  [incident-response plan](../../../../ops/incident-response/docs/incident-response-plan.md):
  continuous **Govern/Identify/Protect** readiness feeding live
  **Detect/Respond/Recover**, closed by **Learn**.
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

- [`ops/README.md`](../../../../ops/README.md) - the entry point to both trees;
  return here whenever you need to find the next document rather than
  paraphrasing it from memory.
- [incident-response-plan](../../../../ops/incident-response/docs/incident-response-plan.md) -
  re-read the full lifecycle and the compliance mapping (ISO 27001
  A.5.24-A.5.28, SOC 2 CC7.3-CC7.5).
- [bcp](../../../../ops/business-continuity/docs/bcp.md) and
  [dr-plan](../../../../ops/business-continuity/docs/dr-plan.md) - the business
  and technical halves of business continuity, kept live by the
  [test-and-exercise program](../../../../ops/business-continuity/docs/test-and-exercise.md).
