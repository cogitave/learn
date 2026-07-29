Knowing the entry shape is only useful if you actually reach for it before
writing code. [patterns/README.md](../../../../standards/docs/patterns/README.md)
states the loop as four steps.

## The four-step loop

1. **Query before you generate.** Every pattern is a Doc node projected into
   Core and reachable over MCP. Ask `docs_search` for the task - "add an HTTP
   endpoint", "emit a domain event" - or `query_graph` for `Pattern` nodes and
   their `governedBy` edges, before writing any code.
2. **Read the entry, follow the two links.** Read *the canonical way* for
   orientation, then open the **governing standard** (the rules you must obey)
   and the **reusable artifact** (the code you start from). The entry itself is
   deliberately short - it is not where the authority lives.
3. **Start from the artifact, not a blank file.** Scaffold from the named
   template, extend the named primitive, or copy the named snippet. A repo
   scaffolded from `templates/base` already inherits the floor, the standards,
   the lifecycle, and the identity - the next module in this path,
   @cogitave.learn.inherit-the-project-baseline, walks through exactly what that
   inheritance covers.
4. **If you must go off-road, own it.** Deviating from a golden path is allowed,
   but it is a decision with a cost: you record the rationale (an ADR or a
   lifecycle `evaluate` note), you own the resulting maintenance, and you still
   have to satisfy the
   [Definition of Done](../../../../agents/lifecycle/definition-of-done.md) -
   going off-road does not exempt you from it.

> [!TIP]
> The rule of thumb for anything new: query the catalog, compose from the named
> artifact, and only author new after a recorded "no fit" - then contribute the
> new pattern back, so the next project finds it. An industrial-standard
> solution that stops at the catalog becomes *your* standard.

## Patterns stop here, once chosen

Cogitave's [ADR-0022](../../../../standards/docs/decisions/0022-patterns-catalog-and-project-inheritance.md)
(part A3) makes the principle explicit: once a golden path is chosen, the industry
practice it ports **becomes** the standard, and your estate does not
re-shop the same decision on the next task. New patterns enter at a `trial` or
`assess` maturity and are promoted to `adopt`, per the same vocabulary as the
[technology-radar](../../../../standards/docs/standards/technology-radar.md); a
retired path is marked `supersededBy`, never deleted, symmetric with how a
superseded ADR is handled. That is what makes the catalog a reference you can
build a habit on: entries do not vanish out from under a decision you made
against them last quarter.

## Day-0 honesty

The catalog and the MCP query surface it is built on are the design this module
teaches you to use; per Cogitave's ADR-0022 and its own consequences, such a
catalog seeds from the templates and standards already authored and grows as more
patterns are proven in real use - it is not a promise that every conceivable task
already has a polished entry. Where it is silent, step 4 is exactly what you do next.
