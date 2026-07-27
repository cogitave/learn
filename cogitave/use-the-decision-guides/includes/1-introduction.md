Every product engineer eventually asks the same three questions: which data
store, which compute shape, which model. Left to per-team taste, the answers
drift - one service reaches for MongoDB because someone liked it last job,
another stands up a Redis cluster "just in case," a third calls the frontier
model for a task a fast tier would handle. Cogitave answers all three with a
**directive guidance system** instead: a decision guide that tells you the
default, walks you through a real decision tree, and states exactly when - and
how - you are allowed to choose something else.

> [!IMPORTANT]
> A decision guide **prescribes**, it does not merely describe. It is not a
> list of options for you to weigh; it names the default and requires a
> recorded, evidence-backed reason to land anywhere else.

Three guides exist today, one per selection domain:

- [Database selection](../../../../standards/docs/standards/database-selection.md) -
  which operational data store for a workload.
- [Infrastructure selection](../../../../standards/docs/standards/infrastructure-selection.md) -
  which compute, storage, messaging, caching, or edge shape for a workload.
- [Model selection](../../../../standards/docs/standards/model-selection.md) -
  which model capability tier to call for a task.

All three are governed by one decision:
[ADR-0021](../../../../standards/docs/decisions/0021-technology-selection-guidance.md),
which places them as a **selection** layer sitting above the
[technology radar](../../../../standards/docs/standards/technology-radar.md)'s
Adopt/Trial/Assess/Hold rings and above the domain standards that say *how* to
build once a choice is made.

## Why this matters

A guidance system only earns its name if you actually use it: read the
default, walk the tree in order, and - if you must deviate - record the
measured need in an ADR rather than defaulting from memory or habit. This
module teaches you to do exactly that, and it is the **last module** in the
"Patterns and golden paths" learning path: finishing it completes the path and
earns its trophy.

## What you will get from this module

Not a summary of three standards to memorize, but the ability to **open any of
the three guides cold**, find its default, walk its decision tree for a real
workload or task, and know precisely what a deviation must record before it is
justified.
