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
  - massar
  - diyar
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

## App package

A Diyar app is a signed declarative package - a manifest, a grant, and a device
profile - that only selects among certified logic already compiled into the
device firmware; it ships no code, container, or interpreter. It requests one
of exactly three non-implicative permission tiers (`OBSERVE`, `OPERATE`,
`ACTUATE`), and what it may actually do at runtime is the offline intersection
of what the manifest requests, what its grant allows, and what the firmware has
certified to actuate (A n B n C) - computed from signatures alone, with no
cloud round trip.

## Capability

A named authority an agent may exercise - a tool it may call, a resource it may
read. Capabilities are an **allow-list**: an agent can do exactly what it declares
and nothing more. See
[Agent identity and capabilities](agent-identity-and-capabilities.md).

## Capability grant

The explicit, least-privilege set of capabilities an agent runs under. Default
deny. Widening a grant is a human decision, never a workaround.

## Cogitave Core

Cogitave's single canonical property graph - one typed model that every
product, standard, and piece of documentation across the estate projects
into, served behind one MCP-native query layer. It is why a human and an
agent asking the same question get the same answer: there is one model to
query, not one store per product.

## Comms-loss watchdog

A field-side heartbeat that makes a networked actuator (Modbus, OPC-UA, or
BACnet) drop to its safe, de-energized output on its own, inside a declared
expiry window, the moment it stops hearing from the edge controller -
independent of whether the edge process or the cloud link is still alive.
Diyar requires one on every field device it actuates over a network, so a
lost link is fail-safe by construction rather than by a check the edge side
could also miss.

## De-energize-to-trip

The governing safety principle behind Diyar's heater control: the safe state
is always *heater off*, and any loss of control, evidence, or confidence - a
software fault, a stalled loop, a lost sensor reading, a failed journal write,
even a reboot - must fall to that state rather than hold the last commanded
one. It is enforced in layers, from a mandatory hardware thermal cutoff down
to a software typestate that releases the relay on drop.

## Device profile

The signed, per-device configuration document that tells Diyar's
product-agnostic runtime what it is running on: channels, actuators, safety
limits, process parameters, and which certified verdict engine to bind. The
edge loads it parametrically at boot, fail-closed, so a different machine or
process is a configuration change, not a fork.

## Dial-out (SSM/Arc) model

The remote-access topology Massar uses instead of a VPN or mesh network: the
device-side agent holds one persistent outbound connection to the cloud, and
an operator reaches the device only through that relay, never by an inbound
port on the device itself. Named for the AWS SSM Session Manager / Azure Arc
pattern it follows.

## Diyar

Cogitave's edge-autonomous platform for regulated field devices - kilns, cold
rooms, and other equipment that must keep working, and keep proving what they
did, without the network. What a specific industry needs on top of the
platform is a **solution**: a signed device profile plus a certified verdict
engine, plugged in rather than forked.

## Evidence

A write-once record of an action, produced to the OpenTelemetry specification.
Assume non-repudiation: evidence is what a reviewer or auditor reads, not a log
you tidy up afterwards.

## Fact registry

The `facts.yaml`-backed registry that gives every load-bearing atomic fact - a
number, a ceiling, a closed list - exactly one owner document; every other
artifact cites it instead of retyping it. A read-only scanner (`fact-drift.py`)
reads the estate and fails the quality gate the moment a restatement drifts
from its owner, catching what the graph's own `xref`/`dependsOn` edges cannot
on their own.

## Fair Source / FSL-1.1-MIT

Namzu's licence. The source is readable and usable now, and every published
version converts to MIT two years after its release.

## Governed run / governed request

The metered unit Cogitave prices agent usage on: one execution of an agent
under its capability grant, sandboxed and evidenced. Self-host Community stays
unlimited on the operator's own compute; the managed Cloud free tier caps at
25 governed requests a month, and paid tiers meter usage with no hard cap.

## Guardian agent

A small, always-on agent installed on a customer's own device that dials out
to a Cogitave platform and holds no standing shell - a session (a PTY, a
tunnel) is opened only for the duration of an explicit, authorized,
TTL-bounded request. Massar is Cogitave's guardian agent for remote console
access.

## HAL seam

The hardware-abstraction boundary in Diyar's edge runtime - `TempSource`,
`RelayBank`, and `MonotonicClock` - above which nothing knows which physical
board is attached. New hardware becomes a driver behind this seam rather than
a fork of the safety or verdict logic that sits above it.

## ISPM-15

The phytosanitary standard for wood packaging material - 56C core temperature
held for 30 minutes - and the name of Diyar's first certified solution. It is
one implementation behind the platform's `VerdictEngine` seam, not the product
itself: the same platform runs a different process by swapping the device
profile and the certified engine.

## Learning path

An ordered programme of modules in [training](/training/). Completing one earns a
trophy.

## Massar

Cogitave's guardian dial-out remote-console agent: a small, cross-platform
binary installed on a customer's device that dials out to Diyar's console
broker so an authorized operator can open an audited web terminal to it, with
no inbound port and no VPN. It holds no standing shell - a PTY exists only for
an explicitly opened, TTL-bounded session.

## MCP - Model Context Protocol

The protocol Cogitave exposes capabilities over. Tools are actions with typed
input and output; resources are addressable read-only surfaces. The point of
being MCP-native is that a human calling an API and an agent calling a tool reach
the *same* surface, not two implementations of it.

## Module

A short, self-contained unit of [training](/training/) - a handful of units, an
exercise, and a knowledge check. Completing one earns a badge. A module stands on
its own even when it belongs to a learning path.

## Namzu

Cogitave's agent kernel for TypeScript - see
[What Namzu is](what-is-namzu.md). Where "Agent kernel" above names the
concept, Namzu is the concrete, Fair-Source-licensed implementation you
install from npm and run on Node.

## Project baseline

The set of standards and scaffolding every Cogitave repo inherits from
`templates/base` at birth: always-on standards every repo gets regardless of
type, plus conditional standards switched on by the repo's product type
(SaaS, API, frontend, agent). A repo does not assemble its own toolchain - it
is born with the baseline already wired in.

## Property-graph substrate

The physical implementation of Cogitave Core: one Rust process co-locating a
lexical (BM25) engine, a vector (HNSW) engine, the typed property graph
itself, and an embedded MCP server behind one query layer, so a query never
crosses a network boundary mid-flight. Chosen as a labeled property graph -
now ISO/IEC 39075:2024 (GQL) - over a relational-plus-graph-view, a triple
store, or a federated document store.

## Provider / provider driver

A model vendor adapter, published as its own package (`@namzu/openai`,
`@namzu/ollama`, and others). The kernel treats every driver identically, so
switching vendors is a change at registration. See
[Choose a provider](choose-a-provider.md).

## Request lifecycle

The one process every change in the estate moves through: a unit of change is
a `Request`, a first-class Cogitave Core node, driven through seven stages by
the same two write tools whether a human or an agent is driving it. The rule
underneath every stage is propose-only - agents draft, classify, and open
issues and PRs; they never merge, apply, release, or write a protected branch.

## Sandbox

The enforcement layer for a capability grant. Namzu ships process-level isolation
using platform primitives (bubblewrap, Seatbelt) and container-level isolation
with a JWT-authenticated egress proxy. Declared in the kernel, enforced by the
sandbox.

## Solution

Diyar's word for the domain-identity layer - the offering a device runs, such
as ISPM-15 heat treatment - as distinct from the platform underneath it. Read
as one sentence: an app deploys a solution to a device, realized by a
certified engine and configured by a signed profile.

## Sovereign unikernel

A kernel that owns the hardware it runs on rather than sitting as a process
inside another operating system - so its isolation, memory, and audit guarantees
are enforced by a layer you control. [Yuva](what-is-yuva.md) is Cogitave's.

## Tamper-evident evidence chain / Merkle history tree

Diyar's evidence model: each reading is hash-chained to the one before it, and
a per-session Merkle history tree is layered on top of that chain to give
inclusion and consistency proofs in O(log n) instead of requiring every prior
reading to prove one exists. The tree is what catches a retroactive edit
between two published roots, which a sequential chain alone cannot see.

## Tool

A capability with typed input and output that an agent may invoke. Typed on both
sides: the kernel validates input before a handler runs, so a handler only ever
sees well-formed arguments.

## Unit

The smallest piece of [training](/training/) - one page, a few minutes. Some units
are prose, some are exercises, and some are knowledge checks.

## Verdict engine

The pluggable pass/fail rule behind Diyar's `VerdictEngine` port. A **product
engine**, like `solution-ispm15`, wraps one frozen, certified regulatory rule;
a **generic engine** (`telemetry-only`, `threshold-hold`, and others) is a
certified, parameterized function block that many solutions can reuse as pure
data, with no new code. Only an engine listed in the firmware-compiled
`CERTIFIED_ENGINES` registry may be named by a signed device profile - signing
a profile is deliberately not enough to introduce a new rule.

## Yuva

Cogitave's sovereign unikernel - see [What Yuva is](what-is-yuva.md). Where
"Sovereign unikernel" above names the concept, Yuva is the concrete `no_std`
Rust implementation; today its live inference is MOCK and learning is DORMANT,
reported honestly rather than implied.

## Next steps

- [What Namzu is](what-is-namzu.md)
- [What Yuva is](what-is-yuva.md)
- [Agent identity and capabilities](agent-identity-and-capabilities.md)
