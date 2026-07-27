---
uid: cogitave.learn.docs.what-is-namzu
title: What Namzu is
description: Namzu is an agent kernel for TypeScript, not an application framework. What that distinction buys you, what the kernel owns, what it deliberately refuses to own, and how the layering keeps your stack yours.
type: explanation
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
roles:
  - developer
  - solution-architect
level: beginner
order: 1
status: draft
---

# What Namzu is

**Namzu is an agent kernel for TypeScript.** It runs agents the way an operating
system runs processes: isolation, scheduling, budgets, signals, memory,
durability, and an auditable event stream. It does not render a user interface,
it does not choose your database, and it does not have a favourite model vendor.

## The distinction that matters

Most agent libraries are *application frameworks*. They ship a chat interface, a
hosted dashboard, a fast path for one vendor, and drivers for a handful of
databases. You get a demo in an hour. Three months later the framework owns your
frontend, your storage, your observability, and your model choice - and none of
those decisions were yours.

Namzu takes the Unix position instead. At the bottom sits a kernel that:

- isolates work and mediates what it can reach,
- schedules tool calls and propagates signals across a call tree,
- manages memory pressure and persists checkpoints,
- emits an auditable event stream.

Above the kernel is user space: shells, editors, IDEs, voice gateways, React
apps - whatever you want. The kernel does not care which one you pick, and the
one you pick cannot break the isolation the kernel provides.

## What the kernel owns

| Concern | In the kernel |
|---|---|
| Agent lifecycle, scheduling, signals | Yes |
| Budgets and memory pressure | Yes |
| Durability and checkpoints | Yes |
| Inter-process communication, MCP and A2A | Yes |
| Provider abstraction | Yes - one uniform surface |
| Auditable event stream | Yes |

## What it refuses to own

This list is a feature, not a gap:

- **No user interface.** No chat window, no dashboard, no components.
- **No hosted service.** Nothing phones home; there is no control plane you must
  sign into.
- **No favoured vendor.** Providers are drivers in separate packages
  (`@namzu/openai`, `@namzu/anthropic`, `@namzu/ollama`, and others). You install
  the one you use; the kernel treats them identically.
- **No opinion about your data layer.** Contracts, not drivers.

The consequence is that swapping a model vendor is a one-line change at
registration, and swapping the shell around your agent is not the kernel's
business at all.

## How it is licensed

Namzu is **Fair Source**: `FSL-1.1-MIT`. Every published version converts to MIT
two years after its release. You can read the source, run it, and build on it
today, and the code becomes fully permissive on a published schedule.

## Where Yuva fits

Namzu and [Yuva](what-is-yuva.md) are separate products at different layers, and
Namzu does not require Yuva. Namzu is a TypeScript kernel you install from npm
and run on Node. Yuva is a from-scratch sovereign unikernel in Rust - a much
lower floor, with its own maturity and its own honest status. Read the Yuva page
before assuming the two are a single stack.

## Next steps

- [Quickstart](quickstart.md) - a working call in five minutes.
- [Choose a provider](choose-a-provider.md) - the eight drivers.
- [Packages](packages.md) - the whole published surface, package by package.
- [Agent identity and capabilities](agent-identity-and-capabilities.md) - the
  authorisation model every Cogitave agent runs under.
