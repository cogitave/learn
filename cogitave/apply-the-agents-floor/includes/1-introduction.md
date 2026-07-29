Every organization has rules. Most keep them in a wiki nobody reads, written for
humans and ignored by the automation that does the work. An AI-native org does the
opposite: it keeps its rules in **one file, in the root of the codebase, addressed
to both the people and the agents that change it** - a small, non-negotiable
**floor** that holds whether the next change came from a person or a model.
Cogitave is one org that works this way, and this module uses its floor as the
worked example.

The file is [`AGENTS.md`](../../../../../AGENTS.md), an open standard for exactly
this purpose: every coding and automation agent - and every human in a session -
reads the nearest `AGENTS.md`, and the root file is the **floor** that all
sub-trees inherit. Cogitave's own root `AGENTS.md` is its **managed policy**; it
opens with a section titled *"Non-negotiable rules (the floor)"* and lists seven
of them. This module teaches those seven as a concrete floor you can learn from
and adapt to your own estate.

> [!IMPORTANT]
> A floor is **the floor, not a suggestion**. Cogitave's seven rules are numbered
> 1 to 7 in its `AGENTS.md`, and this module teaches them in that order. When the
> floor and a habit disagree, the floor wins.

## Why a floor at all

In an AI-native org, agents change the same code and infrastructure that people
do. A floor that **both a person and an agent can read** is what lets a narrow,
cheap model act unattended and still stay correct - the environment carries the
rules, so they hold whether the author was human or not. In Cogitave's estate you
are working inside a **control plane**, and every change is auditable evidence: a
reviewer or an auditor will read your diff.

A good floor also stays **short** and delegates the detail to an **owning
standard**. Cogitave's does exactly this: `AGENTS.md` states the rule and points
you at the canonical document under
[`standards/docs/standards/`](../../../../standards/docs/standards/). Learn the
floor from the one file; learn the specifics from the standard it cites. Never
paraphrase a rule from memory when the source is one link away.

## What you will get from this module

Not a tour of opinions - a working command of the seven rules on Cogitave's floor,
a clear picture of **what enforces each one** (a hook, a CI gate, an org ruleset,
or policy-as-code), and the ability to apply a floor like it to your very first
change.
