---
uid: cogitave.learn.docs.glossary
title: Glossary
description: The terms used across Cogitave documentation and training, defined once - agent kernel, capability grant, provider driver, sandbox, sovereign unikernel, MCP, evidence, and the words that are easy to assume.
type: reference
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
  - yuva
roles:
  - developer
  - solution-architect
  - platform-engineer
level: beginner
order: 2
status: draft
---

# Glossary

Terms are defined here once and used consistently everywhere else. Where a word
is used differently elsewhere in the industry, that is noted.

## Agent

A program that pursues a goal by calling tools, under an identity, inside a
capability grant. In Cogitave usage an agent is a *process*, not a chat session -
it has a lifecycle, a budget, and an audit trail.

## Agent kernel

The layer that runs agents the way an operating system runs processes: isolation,
scheduling, signals, budgets, memory, durability, and an event stream.
[Namzu](what-is-namzu.md) is Cogitave's agent kernel. A kernel is deliberately
*not* an application framework - it ships no interface and picks no vendor.

## Capability

A named authority an agent may exercise - a tool it may call, a resource it may
read. Capabilities are an **allow-list**: an agent can do exactly what it declares
and nothing more. See
[Agent identity and capabilities](agent-identity-and-capabilities.md).

## Capability grant

The explicit, least-privilege set of capabilities an agent runs under. Default
deny. Widening a grant is a human decision, never a workaround.

## Evidence

A write-once record of an action, produced to the OpenTelemetry specification.
Assume non-repudiation: evidence is what a reviewer or auditor reads, not a log
you tidy up afterwards.

## Fair Source / FSL-1.1-MIT

Namzu's licence. The source is readable and usable now, and every published
version converts to MIT two years after its release.

## Learning path

An ordered programme of modules in [training](/training/). Completing one earns a
trophy.

## MCP - Model Context Protocol

The protocol Cogitave exposes capabilities over. Tools are actions with typed
input and output; resources are addressable read-only surfaces. The point of
being MCP-native is that a human calling an API and an agent calling a tool reach
the *same* surface, not two implementations of it.

## Module

A short, self-contained unit of [training](/training/) - a handful of units, an
exercise, and a knowledge check. Completing one earns a badge. A module stands on
its own even when it belongs to a learning path.

## Provider / provider driver

A model vendor adapter, published as its own package (`@namzu/openai`,
`@namzu/ollama`, and others). The kernel treats every driver identically, so
switching vendors is a change at registration. See
[Choose a provider](choose-a-provider.md).

## Sandbox

The enforcement layer for a capability grant. Namzu ships process-level isolation
using platform primitives (bubblewrap, Seatbelt) and container-level isolation
with a JWT-authenticated egress proxy. Declared in the kernel, enforced by the
sandbox.

## Sovereign unikernel

A kernel that owns the hardware it runs on rather than sitting as a process
inside another operating system - so its isolation, memory, and audit guarantees
are enforced by a layer you control. [Yuva](what-is-yuva.md) is Cogitave's.

## Tool

A capability with typed input and output that an agent may invoke. Typed on both
sides: the kernel validates input before a handler runs, so a handler only ever
sees well-formed arguments.

## Unit

The smallest piece of [training](/training/) - one page, a few minutes. Some units
are prose, some are exercises, and some are knowledge checks.

## Next steps

- [What Namzu is](what-is-namzu.md)
- [What Yuva is](what-is-yuva.md)
- [Agent identity and capabilities](agent-identity-and-capabilities.md)
