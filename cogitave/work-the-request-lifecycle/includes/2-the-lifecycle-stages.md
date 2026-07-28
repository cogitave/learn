A Request always carries exactly one `stage` from a fixed enum. The stages run in
order, and each one **produces an artifact** and **passes a gate** before the next
begins.

| # | Stage | Artifact it must produce | Gate that lets it advance |
| --- | --- | --- | --- |
| 1 | intake | intake form + issue + draft Request node | form valid; identity and owner assigned |
| 2 | evaluate | classification + security/dependency assessment | triage sign-off + security clear |
| 3 | plan | task DAG + blast radius + per-task scope | plan approved |
| 4 | document | RFC / ADR / design doc (design-class only) | consensus reached, decision Accepted |
| 5 | implement | branch + signed Conventional commits + draft PR | inside grant; no protected write or apply |
| 6 | review | completed Definition-of-Done checklist | DoD == 100% + CODEOWNER approval |
| 7 | done | changelog + docs sync + evidence token | doc-drift clear + evidence recorded |

`rejected` is a terminal sub-state of **evaluate** - an out-of-scope or duplicate
request stops there, with a recorded reason. The full detail of each stage lives
in [`LIFECYCLE.md`](../../../../agents/lifecycle/LIFECYCLE.md); read it there
rather than trusting this summary from memory.

## Stages auto-advance; the human is an exception

A stage **auto-advances when its automated checks are green** - schema and typed
validation, policy-as-code, a security clear, and (for a behavior change) a green
eval gate. A human is not asked to sign off at every boundary. A human is pulled
in on an **exception**: a gate check fails, confidence is low or the case is
novel, drift or a policy violation is detected, or the transition is in the
minimal always-human set (merge / apply / release and the irreversible actions).

> [!NOTE]
> Stage 4 (document) is **skipped** for non-design-class changes: they advance
> `plan -> implement` directly, and the skip and its justification are recorded on
> the Request.

## The two write tools only propose

The whole lifecycle exposes exactly **two write tools**, and this is the property
to internalize:

- `request_intake` - stage 1. Opens the GitHub issue and creates the draft
  Request node.
- `advance_stage` - stages 2 through 7. Records each stage transition.

> [!IMPORTANT]
> Both are **propose-only**: they open a GitHub issue or PR and stage a *draft*
> Request node. **Neither** mutates protected state, merges, applies, or releases.
> A failed gate returns the Request to the prior stage with a recorded reason, and
> every transition is written as WORM evidence bound to the acting identity.

So an agent can carry a change all the way to the edge of `review` autonomously -
but the merge, the apply, and the release stay on the far side of a human gate.
