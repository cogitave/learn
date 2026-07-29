An AI-native org runs its own operations the same way it ships software: with
agents. The transferable premise is **dogfooding** - if the agent platform you
build is good enough to sell, it should be good enough to run your own company,
and running the company is the honest test of the platform.

Cogitave is one such org: `yuva` is its Agent OS, `namzu` its Agent Kernel, and
its operating premise is that the estate should run itself with those same
products. That premise has a name and a governing document:
[agentic-operations](../../../../standards/docs/standards/agentic-operations.md),
Cogitave's standard for how agents run its engineering estate and its business
operations - the worked example this module reads.

> [!IMPORTANT]
> Read the standard's own framing first: *"If our agents cannot safely run
> Cogitave, they are not ready to run anyone else."* Agentic operations is not a
> side project - it is the test a company applies to its own platform. Read
> that as the pattern: an org proves its agents on itself before it trusts them
> anywhere.

## Two halves, one contract

The pattern splits the fleet in two - agents that run the **engineering** estate
and agents that run the **business** - under one shared contract. Cogitave's
instance realizes that split as two directories, each with its own catalog of
named agents:

- [`agents/scheduled/`](../../../../agents/README.md) runs the **engineering**
  estate - PR triage, dependency review, issue grooming, docs sync, security
  triage.
- [`agents/operations/`](../../../../agents/operations/README.md) runs the
  **business** - marketing, RevOps/sales, customer support, finance/FinOps, and
  incident/status communications.

Whichever half it belongs to, every agent satisfies the same three-part
contract: a first-class identity with a least-privilege capability grant, a run
inside the [request lifecycle](../../../../agents/lifecycle/LIFECYCLE.md), and a
release gated by the [eval harness](../../../../agents/evals/eval-harness.md).
This module teaches you to read that contract and to study the real fleet that
implements it.

## Day-0 honesty

> [!NOTE]
> The agentic-operations standard is explicit: **"These are specs, not running
> systems. No ops agent is live yet."** Everywhere this module says an agent
> "does" something, read it as the spec'd behavior once that agent is built and
> passes its evals - not a claim that it runs in production today.

## What you will get from this module

A working definition of agentic operations, the **draft-vs-act rule** that
decides when an agent acts unattended and when it stops for a human, and a
named tour of Cogitave's fleet - which agent proposes what, and who holds its
human gate - as a concrete model for the fleet you would build.
