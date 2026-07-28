You can now reason about a service's reliability targets the way the reliability
standard does, not just recite the word "SLO."

In this module, you:

- Learned the thesis that reliability is a **budgeted feature**, not an absolute,
  and why that makes SRE an engineering discipline rather than a renamed ops
  rota.
- Set an SLO from a **critical user journey**, picked the right tier target, and
  computed the **error budget** and **burn rate** it produces - 99.9% over 30
  days buys about 43 minutes.
- Read the **error-budget policy** - healthy vs. exhausted vs. repeated breach -
  and named its one accountable owner, the reliability champion.
- Saw what operating on that budget buys: sustainable on-call, a capped and
  automated toil load, tested resilience through capacity and chaos, and an SLA
  that is always looser than the SLO behind it.

## Next steps

- @cogitave.learn.respond-to-incidents - continue the **Operate the estate**
  path here, where a burn-rate page becomes a declared incident under the
  severity matrix.
- The **reliability.md** standard, in the estate's standards repository, is
  worth keeping open whenever you set or review a real service's SLO.
- **ADR-0020** is the governance decision behind the error-budget policy.
