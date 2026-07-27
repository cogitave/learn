Inheriting the ruleset is only half of staying on the paved road. The other half
is a habit: **discover before you build**. Before you write a service, an
endpoint, a background job, or a UI component, you look for how Cogitave already
does it — and start from that.

The [patterns catalog](../../../../standards/docs/patterns/README.md) is where you
look. It is the machine-queryable index of "how do I do X the Cogitave way?", and
it exists precisely so that an agent or a person discovers before generating.
**Building from scratch is the exception that must be justified, not the default.**

## What a catalog entry is — and is not

The catalog does not invent policy and it does not restate standards. Each entry
is a thin, honest pointer with the **same five sections**:

| Section | What it tells you |
| --- | --- |
| **Problem** | when to reach for this pattern |
| **The Cogitave way** | the one canonical solution, concretely |
| **Governing standard(s)** | the authority — the rules live *there*, not in the entry |
| **Reusable artifact** | the template, primitive, or snippet you start from |
| **Anti-pattern** | what agents most often wrongly generate instead |

The authority always lives in the standard; the catalog only tells you which door
to walk through.

## The four-step loop

1. **Query before you generate.** Every pattern is a node reachable over MCP. Ask
   for the task ("add an HTTP endpoint", "emit a domain event") before writing any
   code.
2. **Read the entry, follow the two links** — its governing standard (the rules you
   must obey) and its reusable artifact (the code you start from).
3. **Start from the artifact, not a blank file.** Scaffold from the named template,
   extend the named primitive, or copy the named snippet. A repo born from a
   template already inherits the floor, the standards, the lifecycle, and the
   identity.
4. **If you must go off-road, own it.** Deviating is allowed, but it is a decision
   with a cost: you record the rationale (an ADR or a lifecycle *evaluate* note),
   you own the maintenance, and you still satisfy the Definition of Done.

> [!TIP]
> The rule of thumb for anything new: **query the catalog, compose from the named
> artifact, and only author new after a recorded "no fit" — then contribute the
> new pattern back**, so the next project finds it. An industrial-standard
> solution that stops at the catalog becomes *our* standard.

This is the concrete enactment of the reuse-first, discover-before-generate rule
the always-on standards inherit. Reuse over regeneration is not a preference here;
it is the inherited default.
