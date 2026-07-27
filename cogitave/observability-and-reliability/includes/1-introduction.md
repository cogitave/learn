You cannot manage what you cannot measure, and you cannot promise a reliability
number you never observe. This final module of the path is about both halves:
how Cogitave **measures** a running system, and how it turns that measurement
into an **engineered** reliability discipline instead of a hope.

The two halves are owned by two standards, and they are deliberately kept
separate. The
[observability standard](../../../../standards/docs/standards/observability.md)
is the **measurement** layer - the telemetry spine (traces, metrics, logs) and
the SLI/SLO definitions. The
[reliability standard](../../../../standards/docs/standards/reliability.md) sits
**on top of it** and adds the engineering: how to set an SLO, how to alert on it,
and the error-budget policy that decides when the team stops shipping. The
process decision behind both is recorded in
[ADR-0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md).

> [!IMPORTANT]
> Observability **defines** the SLIs, SLOs, and the freeze trigger; reliability
> **engineers** the SLO, the burn-rate alerting, and the freeze policy behind
> that trigger. Reliability consumes observability - it never restates SLI
> definitions. Learn which standard owns what, and you will always know where to
> look.

## Day-0 honesty

Read every rule here as **the spec each service conforms to as it is built**, not
a report on a running fleet. At Day 0 no service is in production, no SLO is being
burned, and no pager has fired. "The on-call engineer pages" describes the
spec'd behavior once a service is live and instrumented - not a claim that a
rotation runs today. This matches how the rest of the estate reports itself
honestly: Yuva still marks live inference as MOCK and learning as DORMANT.

## What you will get from this module

A working command of the telemetry model - what a trace, a metric, and a log are
in Cogitave and why they are bound to one queryable Core model - plus the
vocabulary of reliability engineering: SLI, SLO, error budget, burn rate, and the
policy that gives an SLO teeth. By the end you should be able to instrument a
service and reason about whether it is reliable enough to keep shipping.
