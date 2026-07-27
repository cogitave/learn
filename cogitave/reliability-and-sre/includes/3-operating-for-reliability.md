An SLO with no consequence is a dashboard. The **error-budget policy** - section 3
of the [reliability standard](../../../../standards/docs/standards/reliability.md),
recorded as a governance decision in
[ADR-0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md)
- is what gives the number teeth, agreed **in advance, in calm**, so the decision
at the moment of breach is mechanical, not political.

## The error-budget policy: the rule with teeth

Every Tier-1 and Tier-2 service must have a written policy, `slo.yaml` plus a
policy note, encoding this governing rule:

> **Budget healthy** -> normal velocity, ship freely behind the deployment gates.
> **Budget exhausted** (or projected to exhaust before the window closes) ->
> **per-service feature freeze**: only reliability fixes, rollbacks, and
> security/critical patches deploy; reliability work goes to the top of the
> backlog until the budget recovers. **Repeated breach** -> escalate: re-tune the
> SLO, or fund a reliability epic.

The freeze is **enforced in the pipeline** - the same protected-environment gate
that governs deploys, reused as the budget freeze - not by good intentions, and it
is **per-service**: one service's blown budget never freezes an unrelated one.
One named **reliability champion** owns the weekly freeze/thaw call; product owns
the SLA but cannot override a freeze by fiat, and a genuine emergency uses the
existing logged, time-boxed break-glass path, never a silent bypass. Security and
critical-severity fixes are always exempt.

## Sustainable on-call and the toil cap

What keeps a service inside its budget between incidents is the operating model
around it. On-call runs **primary and secondary** on a bounded **1-week**
rotation with at least two people in the pool, escalating on a timed no-ack to the
secondary and then to the incident-commander path. Pages are scoped to
**user-facing SLO symptoms only**, time off is owed after a night page, and a
rotation that exceeds a sustainable page count is itself a **reliability defect**
to fix, not a person to toughen up.

**Toil** - manual, repetitive, automatable operational work - is capped at
**~50%** of reliability time; the rule-of-three (a task done manually three times)
produces an automation ticket, not a fourth manual repeat.

## Capacity, chaos, and the SLA it backs

Tier-1 services carry a load model with **20-30% headroom** and degrade
gracefully under overload rather than collapse. Resilience is **tested, not
assumed**: staging-first, hypothesis-driven chaos experiments and quarterly
game-days validate that a failure really does degrade gracefully and that the
runbook actually works - reusing the same DR game-days
[business continuity](../../../../ops/business-continuity/README.md) already runs.

Finally, a customer-facing **SLA must be strictly looser than the SLO** that backs
it. That gap is the operating margin that lets the team react to a burn before
the customer-facing promise breaks - one of exactly two rules in the standard
that may only be strengthened, never relaxed.
