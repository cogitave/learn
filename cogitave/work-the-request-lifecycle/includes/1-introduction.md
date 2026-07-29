An AI-native org routes **every** change - a feature, a fix, a doc, an infra
tweak, a dependency bump - through **one** process. That process is not a habit
or a team convention; it is written down, and it is the authority the automation
implements. Cogitave's own estate works this way, and this module uses its
lifecycle as the worked example you can copy for your own org.

A unit of change is a **Request**: a first-class node in the org's canonical
model, addressed by a stable id, just like an `Agent` or a `Doc`. (In Cogitave's
Core that node reads `cogitave://request/{id}`.) Humans and agents drive the
*same* Request through the *same* stages over MCP, so "what state is this change
in, and why" is a single query an auditor can answer. Cogitave records the
canonical description of those stages in
[`LIFECYCLE.md`](../../../../agents/lifecycle/LIFECYCLE.md) - this module teaches
you to read and use a lifecycle document like it, not to memorise a paraphrase of
it.

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
