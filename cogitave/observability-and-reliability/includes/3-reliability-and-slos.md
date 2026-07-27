Measurement tells you how the system is doing. **Reliability engineering** is what
you do about it. The
[reliability standard](../../../../standards/docs/standards/reliability.md)
consumes the SLIs and telemetry from observability and adds the engineering
discipline on top.

## The thesis: reliability is a budgeted feature

The standard's core claim is that **reliability is a feature with a budget, not
an absolute**. 100% is the wrong target: it is unaffordable, it makes change
impossible, and users cannot tell the difference between 100% and the nines their
experience actually needs. So the job is not to prevent every failure - it is to
**spend a measured, agreed amount of unreliability** on the velocity that ships
value, and to **stop spending** the moment the budget is gone.

This is why SRE is an **engineering discipline, not a renamed ops rota**. A
service that stays up only because a human watches it 24/7 is not reliable; it is
unfunded debt.

## SLO, error budget, burn rate

Three definitions do the work:

- An **SLO (Service Level Objective)** is a target for an SLI, set from the
  **critical user journey** - the thing a customer would open a ticket about -
  expressed as `good events / valid events` over a rolling window. Each service
  ships with three minimum: availability, latency (p99 of the journey), and
  correctness/error-rate.
- The **error budget** is the math: `(1 - SLO) x valid events in the window`,
  tracked as budget remaining. At **99.9% over 30 days** the budget is 0.1% -
  about **43 minutes** of allowed downtime.
- The **burn rate** is how fast you are spending it: rate `1.0` spends the whole
  window's budget exactly over the window; rate `14.4` spends it in about 50 hours.

The inherited tier targets are **Tier-1 99.9%** (~43 min/month), **Tier-2 99.5%**,
and **Tier-3 99.0%** or an explicit no-SLO note. Any other value is a design-class
deviation that needs an Accepted RFC.

## Alert on the burn, page on the symptom

SLO alerts are **burn-rate** alerts, not static thresholds, and use **paired
long+short windows**: the long window sets severity, the short window must also
be firing so a spike that already recovered does not page. You **page** for fast
burns only; slow burns become **tickets**. The anti-fatigue rule is strict: a
service **must not page on a metric that is not in a user's SLO** - the pager is
reserved for symptoms the user feels.

## The error-budget policy: the rule with teeth

An SLO with no consequence is a dashboard. The **error-budget policy** is the
load-bearing rule, agreed in advance so the decision at breach is mechanical, not
political:

> **Budget healthy** -> normal velocity, ship freely behind the deployment gates.
> **Budget exhausted** (or projected to exhaust before the window closes) ->
> **per-service feature freeze**: only reliability fixes, rollbacks, and
> security/critical patches deploy, and reliability work goes to the top of the
> backlog until the budget recovers.

The freeze is **enforced in the pipeline**, not by good intentions, and one named
**reliability champion** owns the weekly freeze/thaw call. [ADR-0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md)
records the decision that the error budget gates release velocity. Two rules in
the standard are **non-deviable** - they may be strengthened, never relaxed: the
freeze on an exhausted budget, and the rule that a **published SLA is always
strictly looser than the SLO** that backs it. That gap is the operating margin
that lets the team react to a burn before the customer-facing promise breaks.

> [!NOTE]
> The freeze is **per-service**: one service's blown budget does not freeze
> unrelated services, and a security or critical-severity fix is always exempt -
> a freeze never blocks a change that improves safety.
