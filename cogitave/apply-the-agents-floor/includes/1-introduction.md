Every organization has rules. Most keep them in a wiki nobody reads, written for
humans and ignored by the automation that does the work. Cogitave keeps its rules
in one file, in the root of the estate, addressed to **both** the people and the
agents that change it.

That file is [`AGENTS.md`](../../../../../AGENTS.md). It is the **managed
policy**: every coding and automation agent - and every human in a session -
reads the nearest `AGENTS.md`, and the root file is the **floor** that all
sub-trees inherit. It opens with a section titled *"Non-negotiable rules (the
floor)"* and lists seven of them.

> [!IMPORTANT]
> The seven rules are **the floor, not a suggestion**. They are numbered 1 to 7
> in `AGENTS.md` and this module teaches them in that order. When AGENTS.md and
> a habit disagree, the floor wins.

## Why a floor at all

You are working inside a **control plane**. Treat every change as auditable
evidence: a reviewer or an auditor will read your diff. A floor that both a person
and an agent can read is what lets a narrow, cheap model act unattended and still
stay correct - the environment carries the rules, so they hold whether the author
was human or not.

Each rule also delegates to an **owning standard** for the detail. AGENTS.md is
deliberately short; it states the rule and points you at the canonical document
under [`standards/docs/standards/`](../../../../standards/docs/standards/). Learn
the floor from AGENTS.md; learn the specifics from the standard it cites. Never
paraphrase a rule from memory when the source is one link away.

## What you will get from this module

Not a tour of opinions - a working command of seven rules you can state, a clear
picture of **what enforces each one** (a hook, a CI gate, an org ruleset, or
policy-as-code), and the ability to apply all seven to your very first change.
