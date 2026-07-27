Every change in the Cogitave estate - a feature, a fix, a doc, an infra tweak, a
dependency bump - moves through **one** process. That process is not a habit or a
team convention; it is written down, and it is the authority the automation
implements.

A unit of change is a **Request**: a first-class Cogitave Core node
(`cogitave://request/{id}`), just like an `Agent` or a `Doc`. Humans and agents
drive the *same* Request through the *same* stages over MCP, so "what state is
this change in, and why" is a single query an auditor can answer. The canonical
description of those stages is
[`LIFECYCLE.md`](../../../../agents/lifecycle/LIFECYCLE.md) - this module teaches
you to read and use it, not to memorise a paraphrase of it.

## The one rule to carry in

The lifecycle does not invent policy; it **sequences** the floor you already
learned into auditable stages. The rule that shapes everything else is
**propose-only**:

> [!IMPORTANT]
> Agents draft, classify, comment, and open issues and PRs. They **never** merge,
> apply, release, or write a protected branch. The consequential action is held
> for a human. Propose is not approve; approve is not deploy.

That is why the whole process has exactly **two write tools**, and why neither of
them can change the world on its own. You will see what they do - and do not do -
in the next unit.

## What you will get from this module

Not a checklist to obey blindly - a working model of how a change travels from an
idea to `done`: the seven stages and what advances each, why the write tools only
propose, and how to read the **Definition of Done** so you can tell when a Request
is genuinely finished versus merely worked on.
