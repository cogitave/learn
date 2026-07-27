"Operating the estate" is not a phase that starts after launch. Cogitave specifies
**how work gets built and how work gets flowed** as one operating model from the
estate's first day, so operations is real from Day 1 rather than something bolted
on once something ships. This module teaches that model in two halves.

## Two loops, one model

The **inner loop** - edit, build, test, in seconds - is the reproducible toolchain
and local/CI parity contract in
[development-process](../../../../standards/docs/standards/development-process.md).
The **outer loop** - how work is planned, prioritized, and flowed as a team - is
the flow-based method in
[ways-of-working](../../../../standards/docs/standards/ways-of-working.md), the
directive choice recorded in
[ADR-0025](../../../../standards/docs/decisions/0025-flow-based-ways-of-working.md).
The outer loop sits **above** the inner loop and **uses** the request-lifecycle
Request - the same Request you moved through the seven stages in the previous
module - as its unit of work.

> [!IMPORTANT]
> Read the outer loop honestly. Both `ways-of-working.md` and ADR-0025 state
> **Day-0, honest: no squad is running this method yet.** It is the spec for the
> method the internal team will run, not a report of one already running. The
> inner loop's toolchain and parity contract, by contrast, are the standard as
> written for every repo today. Keep that distinction as you read.

## What you will get from this module

A working answer to "how does Cogitave operate from Day 1": the pinned,
parity-checked inner loop that keeps "works on my machine" from ever being true,
and the flow-based outer loop - continuous flow plus Shape-Up betting - that
keeps the team (humans and agents) moving work without ceremony or a routine
human checkpoint on every item.

This is the **final module** of the *Operate the estate* path. Completing it
earns the path's trophy.
