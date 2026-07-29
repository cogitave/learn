A reliability discipline builds on the SLI menu that
[observability](../../../../standards/docs/standards/observability.md) already
defines - latency, error rate, availability - and adds **how to set the SLO and
how to alert on it** so it is an operable contract, not a vanity number.
Cogitave's [reliability standard](../../../../standards/docs/standards/reliability.md)
(section 2) is the worked reference for the mechanics below; any AI-native org
applies the same pattern to its own services.

## Set the SLO from the user's journey

An SLI measured on infrastructure ("CPU < 80%") tells you nothing about whether a
user succeeded. Each service **must** define its SLOs from **user-facing SLIs** -
the success of the **critical user journey**, the thing a customer would open a
ticket about - expressed as `good events / valid events` over a rolling 28- or
30-day window. Every user journey needs at least one SLO with an owner and a
target, reviewed **quarterly** and re-tuned to observed reality.

A new service ships with three SLOs minimum - availability, latency (p99 of the
journey), and correctness/error-rate - at one of three inherited tier targets:

| Tier | Target | Monthly budget |
|---|---|---|
| Tier-1 (customer-facing, revenue-path) | 99.9% | ~43 min |
| Tier-2 (important internal / async) | 99.5% | ~3.6 h |
| Tier-3 (batch / best-effort) | 99.0% or an explicit no-SLO note | - |

## Compute the error budget and the burn rate

The **error budget** is `(1 - SLO) x valid events in the window`, tracked as
budget remaining - a percentage and an absolute - and exposed as a queryable fact
on the org's canonical model (Cogitave's Core, in its instance). Worked example:
at **99.9% over 30 days**, the budget is 0.1%, or **~43
minutes** of allowed downtime.

The **burn rate** is how fast that budget is spent: rate `1.0` spends the whole
month's budget in exactly a month; rate `14.4` spends it in about 50 hours.

## Alert on the burn, page on the symptom

A single threshold either pages too late (a slow burn eats the month silently) or
too often (every blip wakes someone). SLO alerts are therefore **burn-rate**
alerts using **paired long+short windows** - the long window sets severity, and a
short window at the same threshold must **also** fire, so a recovered spike never
pages:

| Long window | Burn rate | Budget spent | Action |
|---|---|---|---|
| 1 h | 14.4x | 2% in 1 h | page |
| 6 h | 6x | 5% in 6 h | page |
| 24 h | 3x | 10% in 1 day | ticket |
| 72 h | 1x | 10% in 3 days | ticket |

The anti-fatigue rule is strict: a service **must not** page on a metric outside
a user's SLO - cause-based alerts (a disk filling, a pod restarting) are tickets
or dashboards, never pages, unless they themselves burn an SLO.

> [!NOTE]
> Every default above is exactly that - a default. Shipping a different tier
> target, window, or burn-rate ladder for a service is a **design-class
> deviation** that needs an Accepted RFC recording the service, the dimension,
> the chosen value, and the approver.
