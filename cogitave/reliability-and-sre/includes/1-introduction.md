Every service you run will eventually fail some request. Reliability
engineering makes you answer, in advance, not *whether* that happens but **how
much of it is acceptable, and what happens the moment it isn't**. Cogitave's
[reliability standard](../../../../standards/docs/standards/reliability.md) is
one org's written answer to exactly that, and this module uses it as the worked
example.

## Reliability is a budgeted feature, not an absolute

The thesis: 100% is the wrong target for everything. It is
unaffordable, it makes change impossible, and a user cannot tell the difference
between 100% and the nines their experience actually needs. So the job of SRE is
not to prevent every failure - it is to **spend a measured, agreed amount of
unreliability** on the velocity that ships value, and to **stop spending** the
instant the budget runs out. The **SLO** is the number that makes that trade
explicit; the **error budget** is the currency; the **error-budget policy** is the
law that the currency buys real decisions, not just a dashboard.

> [!IMPORTANT]
> This is why SRE is an **engineering discipline**, not a renamed ops rota. A
> service that stays up only because a human watches it around the clock is
> **not** reliable - it is unfunded debt. Cogitave, for instance, is a small
> remote team with no 24/7 wall-of-screens shift, so automation, not headcount,
> is the only sustainable model.

## What a reliability discipline sits on top of

A reliability discipline does not redefine measurement or incident response - it
**consumes** them. In Cogitave's estate, SLIs and telemetry come from
[observability](../../../../standards/docs/standards/observability.md); a
burn-rate page runs as an incident under
[ops/incident-response](../../../../ops/incident-response/docs/incident-response-plan.md);
disaster scenarios and DR game-days come from
[ops/business-continuity](../../../../ops/business-continuity/README.md). What it
**adds** is the error-budget policy itself, sustainable on-call, the toil cap,
capacity planning, and chaos engineering - the subject of this module.

## What you will get from this module

A working ability to set a service's SLO, compute the error budget it buys, and
say exactly what happens - to velocity, to on-call, to the roadmap - once that
budget is spent.
