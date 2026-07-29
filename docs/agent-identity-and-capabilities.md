---
uid: cogitave.learn.docs.agent-identity-and-capabilities
title: Agent identity and capabilities
description: Every Cogitave agent acts under its own identity inside an explicit least-privilege capability grant, in a sandbox, with every action recorded as evidence. What that model guarantees, and where a human is still required.
type: explanation
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
  - yuva
roles:
  - developer
  - solution-architect
  - platform-engineer
level: intermediate
order: 3
status: draft
---

# Agent identity and capabilities

An agent that inherits whatever authority the process around it happens to have
is not something you can reason about, audit, or safely leave running. Cogitave's
authorisation model exists to make an agent's authority **explicit, narrow, and
recorded**.

Four rules carry it.

## 1. An agent acts under its own identity

Every agent is a **first-class identity**. It does not borrow a human's session,
and it does not run on an ambient credential that happens to be lying around in
the environment. When an action is later reviewed, the actor is the agent - not
"whoever deployed it".

This is what makes the audit trail meaningful. An action attributable to a shared
identity is attributable to nobody.

## 2. Authority is an explicit grant, and the default is deny

An agent may use **only** the tools and resources named in its grant. Nothing is
available because it happened to be reachable.

- Capabilities are an **allow-list**, not a deny-list. An agent can do exactly
  what it declares and nothing more.
- Adding a behavior means adding a declared capability - and, because behavior
  changes are gated, a scenario that proves the new behavior is safe.
- If a task needs more authority than the grant carries, the correct move is to
  request a grant change through a human. Widening a grant to make a step easier
  is the failure mode this model exists to prevent.

> [!CAUTION]
> Never widen a capability to make a failing check pass. Capabilities follow the
> behavior you can prove safe, not the other way around. A grant widened to get
> a green result has removed the only evidence that the result meant anything.

## 3. Execution is sandboxed

The grant says what an agent may reach; the sandbox enforces it. Namzu ships
isolation as a pluggable layer (`@namzu/sandbox`): process-level isolation using
the platform's own primitives - bubblewrap on Linux, Seatbelt on macOS - and
container-level isolation with a JWT-authenticated egress proxy when network
reach has to be mediated rather than merely configured.

Declared in the kernel, enforced by the sandbox. That pairing is the whole
security model: a declaration nobody enforces is documentation, and enforcement
without a declaration is a guess.

## 4. Every action is recorded as evidence

Actions are traced and recorded, to the OpenTelemetry specification, as
write-once evidence. Assume non-repudiation: the record is not a debugging
convenience that can be edited later, it is the artefact a reviewer or an auditor
reads.

`@namzu/telemetry` is the exporter pipeline for that stream - traces and metrics
over OTLP, with resource attributes attached.

## Where a human is still required

Autonomy inside the rails is the default: an agent acts unattended while it stays
inside its grant, its typed inputs and outputs hold, policy checks pass, its
effects are reversible or bounded, and the evaluation gate is green.

A human is summoned as an **exception**, not as a routine checkpoint:

- an automated guardrail or check fails;
- confidence is low, or the case is novel;
- drift, an anomaly, or a policy violation is detected;
- or the action is in the small, explicit always-human set - applying,
  merging, releasing, rotating a secret, changing organization settings, and the
  irreversible-catastrophic actions such as mass data deletion, billing, and
  external publication.

That set is deliberately minimal and shrinks as the rails prove themselves. What
does not shrink is the requirement that every autonomous action stays traceable
to the identity that took it.

## Next steps

- [What Namzu is](what-is-namzu.md) - where the declaration lives.
- [What Yuva is](what-is-yuva.md) - the layer built to enforce it on hardware
  Cogitave controls.
- [Packages](packages.md) - `@namzu/sandbox` and `@namzu/telemetry`.
