An AI-native org runs on one canonical, company-wide incident-response plan.
Cogitave's is
[`incident-response-plan.md`](../../../../ops/incident-response/docs/incident-response-plan.md),
and this unit walks it as the worked example. It models the lifecycle on
**NIST SP 800-61r3** (2025), reframed around the six **CSF 2.0** Functions: the
continuous readiness Functions - **Govern, Identify, Protect** - and the
incident-time Functions - **Detect, Respond, Recover** - with **Learn** feeding
findings back into readiness. This unit walks that live loop: detect, declare,
command, contain, recover, learn.

## Detection and declaration

An incident opens from, in order of how most arrive: an **SLO burn-rate alert**
carrying a `runbook_url` (no page without a runbook), the
[security-triage agent](../../../../agents/scheduled/security-triage.md)
classifying a signal (human-gated), a **customer report** escalated by support,
or any engineer's own observation. Anyone may declare, and nobody is blamed for
declaring something that turns out minor - the plan's rule is
**declare-high-downgrade-later**: when uncertain, declare at the higher
severity and downgrade once the facts firm up.

## Severity: one scale, and the override that always wins

Run **one** severity scale for the whole org. Cogitave's is S1-S4, detailed in
the [severity matrix](../../../../ops/incident-response/docs/severity-matrix.md).
S1 **always** declares a full-response incident; S2 declares when its blast radius
is multi-tenant or growing, has no workaround with a fast-burning error budget,
or is trending toward S1; S3/S4 are worked in the queue.

> [!IMPORTANT]
> A **security-relevant** signal routes onto the security-incident path
> regardless of its apparent severity - even one that looks like an S3. The
> override pages `oncall-security` and engages the Security lead before
> anything else. Apparent severity never outranks a security signal.

## Command: the single-commander model

Roles are **functions, not job titles**, detailed in
[roles-and-raci](../../../../ops/incident-response/docs/roles-and-raci.md): one
**Incident Commander (IC)** with a clear span of control, an Operations lead,
a Communications lead, a Scribe, and - for security-relevant incidents - a
Security lead. Two separations are absolute: the **IC never debugs hands-on**,
and the **IC and a responder are never the same person** - you cannot command
and type at once.

## Containment through recovery: the runbook

Each incident **class** (availability, data, security, agent-safety) has a
[runbook](../../../../ops/incident-response/runbooks/README.md) that every
alert's `runbook_url` points to. The [availability-outage
runbook](../../../../ops/incident-response/runbooks/availability-outage.md)
shows the shared shape: **contain** first (acknowledge, roll back a recent
change, shed load) before deep diagnosis, then diagnose, mitigate, communicate
on a severity-keyed cadence, and verify recovery before closing.

## Closing the loop: the blameless postmortem

Every S1/S2 produces a **blameless**
[postmortem](../../../../ops/incident-response/docs/postmortem.md) within the
PIR window (default 5 business days). Blameless does not mean
accountability-free: it treats every "human error" as a system gap - a missing
guardrail, an ambiguous runbook - and assigns owned, dated action items to fix
the system, not the person. Those findings feed back into Govern, Identify, and
Protect, closing the lifecycle diagram above.
