You can now read the pipeline that ships your change - from a pull request to a
gated production deploy - and follow any gate to the standard that owns it.

In this module, you:

- Traced the **canonical CI stage set** - the ordered, fail-fast gates every
  repository runs on every pull request - and named the **mandatory floor** that
  applies to all project types.
- Learned that **CI is the machine half of the Definition of Done**, and that the
  local hook is only its fast mirror - so the answer to a red required check is to
  fix the change, never to lean on a green hook.
- Saw that stage logic lives **only** in SHA-pinned org reusable workflows that
  repos wire by input, so a gate change is one reviewed pull request for the whole
  estate.
- Followed the **outer loop**: one signed digest promoted `dev` to `staging` to
  `prod` by pull-based GitOps, with signature verification that fails closed,
  SLO-gated canary rollout, and a **human gate on prod** - agents propose, humans
  enact.

## Next steps

- @cogitave.learn.observability-and-reliability - the next module in
  **Cogitave engineering standards**, on measuring a running system and the
  error-budget policy that governs it.
- The **CI/CD pipelines standard** is the canonical stage set, the
  project-type matrix, and the reusable-workflow rules, at the source in the
  estate's standards repository.
- The **deployment and delivery standard** covers environment topology,
  GitOps, progressive delivery, rollback, and the `deploy.yaml` manifest, in
  the same repository.
- **ADR 0017** is the estate's accepted decision behind the pipeline matrix,
  the GitOps default, and the change-management governance over every deploy.
