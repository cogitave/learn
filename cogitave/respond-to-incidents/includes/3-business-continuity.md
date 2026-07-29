A single service outage is an incident. A cloud region loss, a destructive
ransomware attack, or a critical vendor failure is bigger than one incident -
it threatens your org's ability to keep operating at all. That is what
**business continuity** covers, and it runs on the same discipline as incident
response, one level up. In Cogitave's estate, that tree is
[`business-continuity/`](../../../../ops/business-continuity/README.md).

## The chain, in one line

The [BC/DR README](../../../../ops/business-continuity/README.md) states the
program in one line: **BIA decides what matters -> tiers fix RTO/RPO -> backups
and DR strategy meet them -> exercises prove it -> evidence goes to WORM.**
The [Business Impact Analysis (BIA)](../../../../ops/business-continuity/docs/bia.md)
scores each service's impact and derives its **MTPD** (Maximum Tolerable Period
of Disruption); [service tiers](../../../../ops/business-continuity/docs/service-tiers.md)
then assign the smallest tier band whose **RTO is always less than MTPD**.

## Service tiers: RTO/RPO and DR strategy

Cogitave's model uses four tiers to fix how fast a service must return
(**RTO**) and how much data loss is tolerable (**RPO**), each paired with an
AWS Well-Architected DR strategy: **tier-0** (mission-critical, RTO <= 1 h,
warm standby/multi-site), **tier-1**
(critical, RTO <= 4 h, pilot light -> warm standby), **tier-2** (important,
RTO <= 24 h, backup & restore), and **tier-3** (standard, RTO <= 72 h,
backup & restore/redeploy-from-IaC). The technical design that meets each tier
- cross-region replication, PITR, the paired DR region - is the
[DR plan](../../../../ops/business-continuity/docs/dr-plan.md); the backup
mechanics (3-2-1-1-0, immutable/WORM copies, verified restores) are the
[backup strategy](../../../../ops/business-continuity/docs/backup-strategy.md).

## Activation: when this stops being a routine incident

The [Business Continuity Plan (BCP)](../../../../ops/business-continuity/docs/bcp.md)
is explicit that it does **not** replace incident response - it **escalates**
from it. A routine incident is handled under
[`incident-response/`](../../../../ops/incident-response/README.md); the
Incident Commander **declares** BC/DR activation when a tier-0/1 service will
breach its RTO, data loss may exceed RPO, a destructive or security event is
confirmed, a primary region is lost, or an exercise inject calls for it. As in
incident response, the rule when uncertain is to **declare**: under-declaring
costs recovery time.

## Recovery order and failback

> [!NOTE]
> Recovery proceeds in **dependency order**, not tier-number order alone.
> Cogitave's [DR plan](../../../../ops/business-continuity/docs/dr-plan.md)
> sequences **identity** first, then **secrets/PKI**, then the **API/MCP gateway
> and Core**, then observability, then tier-1 products - because nothing else is
> operable without the layers beneath it.

Recovery is not finished at failover. The BCP requires **failback**: validate
data consistency, drain traffic back to the primary region in a controlled
window, confirm SLOs and backups are healthy, then stand down. The
[test-and-exercise program](../../../../ops/business-continuity/docs/test-and-exercise.md)
- tabletops, restore drills, failover drills, and an annual game-day - is what
turns every RTO/RPO from a claim into something measured, and every
activation, exercise, and restore test is retained as evidence per the
[retention schedule](../../../../compliance/docs/retention.md).
