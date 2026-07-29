The **outer loop** - how work is planned, prioritized, and flowed as a team -
needs a method chosen and written down, not defaulted into. Cogitave's answer is a
directive choice recorded in
[ADR-0025](../../../../standards/docs/decisions/0025-flow-based-ways-of-working.md),
operationalized in
[ways-of-working](../../../../standards/docs/standards/ways-of-working.md); this
unit uses it as the worked example of the pattern, not as a law your org must copy.

> [!NOTE]
> Day-0, honest: no squad is running this method yet. This is the spec for the
> method Cogitave's internal team - humans and agents - will run, not a report of
> one already running.

## The choice: flow, plus betting for the big rocks

The transferable shape is a flow-based day-to-day method paired with a separate
mechanism for the big bets. Cogitave's day-to-day method is **WIP-limited
continuous flow** (Kanban-style: visualize the workflow, limit WIP, manage flow,
make policies explicit, run feedback loops, improve collaboratively) - pull-based,
no fixed sprints. Its **larger bets** are shaped and bet **Shape-Up style**: an
**appetite** (the time an idea is worth) replaces the estimate, inside the
quarterly OKR frame. The
[request-lifecycle](../../../../agents/lifecycle/LIFECYCLE.md) Request - the same
seven-stage Request from the previous module - **is** the work item that flows;
this decision does not re-sequence those stages, it defines how items are
prioritized, WIP-limited, and pulled through them. Cogitave does **not** run
vanilla Scrum.

## Why not Scrum

Four facts decided it for Cogitave - and they are worth checking against your own
team, because the answer follows from the facts, not from a rule that flow beats
Scrum everywhere. **Small team plus agents as team members** - Scrum's ceremonies
exist to manage a coordination problem this team does not have. **Trunk-based
continuous delivery** already ships continuously behind flags; a sprint boundary
would batch work that is otherwise done. **Velocity is a poison metric** -
trivially gamed, meaningless as a capacity number once agents are team members -
so flow metrics (cycle time, throughput, WIP, aging) replace it, and never as a
stack-rank. **Cert-grade evidence must be a by-product**, not a separate
ceremony - PR review, a signed merge, and a blameless post-mortem already *are*
the evidence an auditor reads. Where a team lacks these properties - a newer team
needing scaffolding, or fixed-scope, stakeholder-heavy work - the same facts can
point the other way, which is why this is a decision to record, not a default.

## The WIP limit protects human attention, not agent throughput

WIP limits apply to the **human-attention budget** - items awaiting review,
sign-off, or the exception gate - not to raw agent throughput, so the one scarce
resource (human review) never becomes a silently-growing queue. Agents pull,
execute, and finish inside their least-privilege grant at the highest autonomy
level the rails permit, emitting WORM evidence as they go; the **human gate stays
an exception handler**, not a routine checkpoint on every item - the same
doctrine Cogitave's [`AGENTS.md`](../../../../../AGENTS.md) states in rules 6
and 7.

## Feedback loops, and the deviation rule

The method carries its own loops: code review per Request, a design/architecture
review at the lifecycle's document stage, a demo on bet completion, a
retrospective at the cool-down beat, and a blameless post-mortem per incident -
each closes into a tracked, owned action, never left as an un-actioned signal.
Flow is the default; a squad **may** adopt sprints only under a written, specific
reason - a fixed external delivery date, or a new team that cannot yet self-organize
flow - re-evaluated each quarter. Absent a written reason, the answer is flow.
