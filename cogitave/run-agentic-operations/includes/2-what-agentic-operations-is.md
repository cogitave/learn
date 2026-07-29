An agentic-operations standard states a thesis, a scope, and one rule that
governs every agent in the fleet. Cogitave's
[agentic-operations](../../../../standards/docs/standards/agentic-operations.md)
standard is the worked example; here is what it says, and what you would decide
when you write your own.

## The thesis and scope

> A certification-grade, AI-native company should run its own back-office and
> go-to-market the same way it ships software: agents do the high-frequency,
> low-context, reversible work, and humans hold every consequential gate.

The standard does **not** claim a fully autonomous company. It claims a
**co-pilot estate**: agents draft, triage, reconcile, enrich, summarize, and
propose; humans decide. Cogitave's scope draws the line across five business
domains - marketing, RevOps/sales, customer support, finance/FinOps, and
operations/incident-response. In its instance, engineering automation (PR
triage, dependency review, security triage, docs sync) is explicitly **out of
scope** here; it is governed instead under
[`agents/scheduled/`](../../../../agents/README.md) and its own specs, though it
satisfies the same contract below. When you set your own scope, the split of
concern matters more than where exactly you draw it.

## The three-part contract every ops agent satisfies

Section 2 makes an ops agent's identity concrete. It is not a script or a
shared login; it MUST be:

1. A **first-class identity with a least-privilege capability grant** - an
   immutable UID, a workload identity, and an explicit grant scoped to a
   `run_id`. It uses only the tools/resources its grant names; if a task needs
   more, it requests a grant change through a human rather than working around
   the boundary.
2. **Run inside the request lifecycle** - every consequential action is a
   `Request` moving through the seven stages, and the write tools are
   **propose-only**: they open an issue/PR and stage a draft, never `apply` or
   mutate protected state.
3. **Gated by the eval harness** on four axes - accuracy, coverage, safety, and
   latency - before any behavior change ships; safety scenarios default to a
   single failure blocking release.

## The draft-vs-act rule

This is, in the standard's own words, "the single most important rule" - and
it is the heart of the transferable pattern: **an agent acts unattended inside
its rails, and a human gate is an exception handler, not a routine checkpoint.**

> **Default: the agent ACTS autonomously within its grant when the rails
> hold** - typed and validated I/O, policy-as-code, a reversible or canaried
> effect under a blast-radius cap, and a green eval gate. **It ESCALATES to a
> human on an exception**: a guardrail or check fails, confidence is low or the
> case is novel, drift or a policy violation is detected, or the action falls
> in the minimal always-human set. Proposing is the exception path, not the
> default over every correct action.

The standard places that split on a spectrum of consequence and reversibility:

| Loop placement | When it applies | Examples |
| --- | --- | --- |
| Human-OUT-of-loop | Read-only analysis or bounded, reversible internal effects | Triage/classification, tagging, enrichment, duplicate detection, summarization |
| Human-ON-loop | Externally visible or hard-to-reverse; default for mutation | Open a PR/issue, draft a customer reply, queue a campaign, propose a CRM merge |
| Human-IN-loop | Irreversible, high-blast-radius, money, identity, or policy-sensitive | Publishing external content, paying an invoice, changing pricing, anything flagged by a safety eval |

The **must-human-gate boundary** never runs unattended: irreversible
decisions, policy violations, all customer-facing communications, contract
interpretation, budget or payment approval, compensation/hiring decisions,
external commitments, and any novel scenario past the confidence threshold.
In Cogitave's instance these map directly to the org floor - agents do not
publish, pay, deploy, apply infra, rotate secrets, disclose data, or change org
settings without an explicit human gate. Any org adopting the pattern draws its
own version of that same minimal, always-human set.

> [!TIP]
> When a gated action does reach a human, it must arrive as a **15-second
> evidence pack**: what the agent wants to do, the inputs/citations it used,
> the predicted effect, the reversibility, and its confidence - role-routed to
> the right approver, who can approve, approve-with-edits, or deny.
