Every change you make travels the same road before it reaches production. This
module teaches you to read that road: the ordered gates a pipeline runs, why the
green check on your pull request is the gate that actually matters, and how a
built artifact becomes a running workload.

Two standards own this road, and one decision records why it is shaped the way
it is. The
[CI/CD pipelines standard](../../../../standards/docs/standards/ci-cd-pipelines.md)
states the required shape of every delivery pipeline - the canonical stage set,
which gate is mandatory, and the reusable-workflow model. The
[deployment-and-delivery standard](../../../../standards/docs/standards/deployment-and-delivery.md)
governs the outer loop: how a signed artifact is promoted through environments.
Both are governed by
[ADR 0017](../../../../standards/docs/decisions/0017-devops-cicd-and-deployment.md),
the accepted DevOps delivery decision.

> [!IMPORTANT]
> CI **is** the machine half of the Definition of Done. A green pipeline is not
> a formality - it is auditable change-management evidence. The CI/CD standard
> states this directly: a green pipeline is the machine evidence a reviewer or
> auditor reads.

## The pipeline is one machine-enforced flow

The pipeline standard is deliberately not a pile of independent checks. It ties
the test/quality gate, the security/sign/SBOM gate, the release engine, and the
request lifecycle into **one** ordered, machine-enforced flow. Each stage that
proves something delegates the detail to the standard that owns it - the
coverage thresholds live in testing-quality, the signing mechanics live in
supply-chain - so the pipeline standard only mandates that the gate **runs and
blocks**.

That is the reading skill this module builds. You will not memorise every
threshold; you will learn the shape, know which gate is mandatory on every pull
request, and be able to follow any stage to the standard that owns its numbers.

## What you will get from this module

A working command of the canonical CI stage set and its mandatory floor, a clear
answer to *why CI, not the local hook, is the real gate*, and enough of the
deployment model to reason about how your signed change reaches production - one
artifact, promoted forward, with a human holding the prod gate.
