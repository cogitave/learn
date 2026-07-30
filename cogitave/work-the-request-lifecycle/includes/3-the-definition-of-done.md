"Worked on" is not "done." The review stage settles the difference with a
machine-checkable gate: a **Definition of Done**, the operational form of the
floor's own "Definition of done." A Request advances `review -> done` only when
**DoD == 100%** *and* a **CODEOWNER approves**. Cogitave's canonical checklist is
[`definition-of-done.md`](../../../../agents/lifecycle/definition-of-done.md); the
shape of it - a scored checklist plus a separate human sign-off - is what carries
to your own org.

## What DoD == 100% means

A good DoD is **scoped by request type**. Every Request runs a set of **Core**
items; classification flags add **conditional** items on top. Cogitave's instance
fills that shape out like this:

- **Core (every Request)** - code review complete, tests green, evals green for
  any agent-behavior change, the `docs-required` gate satisfied, signed
  Conventional Commits, English only, least privilege honored, standards honored,
  no unapproved mutation, no secrets, links complete, evidence recorded.
- **Conditional (added by flags)** - `impact.breaking` adds migration notes;
  `impact.security` adds a threat model; `type: deps` adds a dependency review; a
  design-class change requires its RFC/ADR already `Accepted`.

Each item is `pass`, `fail`, `n/a`, or `waived`. **DoD == 100%** means no item is
`fail`, every applicable item is `pass`, and every waiver is recorded.

> [!IMPORTANT]
> A waiver requires `{ approver, reason }` and is valid **only for conditional
> items**. **Core items cannot be waived** - there is no rationale that excuses
> skipping code review or signed commits.

## Two gates, not one

The DoD score is the **machine** gate. The CODEOWNER approval is a **separate
human** gate, computed independently. Both are required - this is separation of
duties: propose is not approve.

Cogitave exposes the checklist as data through a `get_dod` tool, so the gate is
queryable rather than a matter of opinion. Its `result` is `done` only when **no
item fails, every applicable item passes or is validly waived, and
`codeownerApproval.approved` is true**. A perfect automated score with no human
approval is *not* done.

## Closing the loop

The final stage (done / doc-update) closes it: draft the Keep a Changelog entry
from the Conventional commits, sync `docs/`, reindex the UID graph, and write a
**completion-evidence token** to the canonical model. Only when doc-drift is clear
and that evidence is recorded does the Request reach `done`.

> [!TIP]
> Before you call anything finished, ask the three questions this unit answers:
> is every applicable DoD item passing (no fails, waivers recorded), did a
> CODEOWNER approve, and is the completion evidence written? If any answer is no,
> it is worked on - not done.
