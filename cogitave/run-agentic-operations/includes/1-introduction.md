Cogitave is an agent company: `yuva` is its Agent OS, `namzu` its Agent Kernel.
The estate's own operating premise is that it should run itself the same way it
ships software - so Cogitave **dogfoods** its own platform to operate the
company. That premise has a name and a governing document:
[agentic-operations](../../../../standards/docs/standards/agentic-operations.md),
the standard for how agents run Cogitave's engineering estate and its business
operations.

> [!IMPORTANT]
> Read the standard's own framing first: *"If our agents cannot safely run
> Cogitave, they are not ready to run anyone else."* Agentic operations is not a
> side project - it is the test the company applies to its own platform.

## Two halves, one contract

Agentic operations spans two directories, each with its own catalog of named
agents:

- [`agents/scheduled/`](../../../../agents/README.md) runs the **engineering**
  estate - PR triage, dependency review, issue grooming, docs sync, security
  triage.
- [`agents/operations/`](../../../../agents/operations/README.md) runs the
  **business** - marketing, RevOps/sales, customer support, finance/FinOps, and
  incident/status communications.

Every agent in both directories satisfies the same three-part contract: a
first-class identity with a least-privilege capability grant, a run inside the
[request lifecycle](../../../../agents/lifecycle/LIFECYCLE.md), and a release
gated by the [eval harness](../../../../agents/evals/eval-harness.md). This
module teaches you to read that contract and the real fleet that implements it.

## Day-0 honesty

> [!NOTE]
> The agentic-operations standard is explicit: **"These are specs, not running
> systems. No ops agent is live yet."** Everywhere this module says an agent
> "does" something, read it as the spec'd behavior once that agent is built and
> passes its evals - not a claim that it runs in production today.

## What you will get from this module

A working definition of agentic operations, the **draft-vs-act rule** that
decides when an agent acts unattended and when it stops for a human, and a
named tour of the fleet - which agent proposes what, and who holds its human
gate.
