Every organization eventually has a bad day: a service goes down, data looks
wrong, a secret leaks, or an entire cloud region disappears. What separates a
bad day from a crisis is whether the response was already written down,
rehearsed, and followed - or improvised under pressure. An AI-native org keeps
that response **as code**, in one operational-resilience tree, authored and
reviewed like any other change. Cogitave keeps its own response in one such
tree, [`ops/`](../../../../ops/README.md), and this module walks it as the
worked example.

In Cogitave's estate, `ops/` is the **operational-resilience** half: how the
org detects, responds to, communicates about, and recovers from anything that
goes wrong, authored and reviewed the same way as any other code. It sits next
to the proactive [reliability standard](../../../../standards/docs/standards/reliability.md)
(SLOs, error budgets, on-call) - reliability is what keeps most days from
becoming bad days; the operational-resilience tree is what happens once one
does.

> [!IMPORTANT]
> **Day 0 caveat.** `ops/` is authoring only: plans, schemas, runbooks, and
> templates - not a running on-call rotation. The
> [ops index](../../../../ops/README.md) is explicit that these plans turn on
> after cutover, sequenced by the Day-1 operate runbook. This module teaches the
> plan you would follow, not a live system you can page.

`ops/README.md` names exactly two areas, and this module teaches both:

- **Incident response** ([`ops/incident-response/`](../../../../ops/incident-response/README.md)) -
  the plan, the severity model, roles, runbooks, communications, and the
  blameless postmortem. This is what fires the moment something breaks.
- **Business continuity** ([`ops/business-continuity/`](../../../../ops/business-continuity/README.md)) -
  the BIA, service tiers, backup strategy, and disaster-recovery plan that keep
  the org's critical activities running through a bigger disruption, like a
  region loss or a destructive attack.

## What you will get from this module

Not a summary to memorize - a working command of the **flow**: how a signal
becomes a declared incident, who commands the response, how a runbook contains
and recovers a specific incident class, and how business continuity escalates
from that same response when the disruption is bigger than one incident. Every
claim in this module traces back to a document under `ops/`; read this module
to learn how to use those documents, not as a replacement for them.
