---
uid: cogitave.learn.docs.what-is-yuva
title: What Yuva is
description: Yuva is a from-scratch, agent-native sovereign unikernel in no_std Rust, with formally verified leaves and a boot that fails closed. What it is for, how it is verified, and exactly which parts are not live yet.
type: explanation
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - yuva
roles:
  - developer
  - solution-architect
  - platform-engineer
level: intermediate
order: 2
status: draft
---

# What Yuva is

**Yuva is a from-scratch, agent-native sovereign unikernel** - a kernel and
micro-VMM written in `no_std` Rust, built to run agent workloads on hardware it
fully controls rather than as a process inside somebody else's operating system.

It is a different layer from [Namzu](what-is-namzu.md), and the two are not a
single stack. Namzu is a TypeScript kernel you install from npm. Yuva is the
floor underneath: it boots on bare metal.

## Why build a kernel at all

An agent that can be observed, paused, or read by the platform hosting it is not
sovereign. Every guarantee you make about an agent's isolation, its memory, and
its audit trail is only as strong as the layer enforcing it. Yuva exists so that
layer is one Cogitave wrote, can verify, and can attest to - not one it rents.

## How it is built

- **`no_std` Rust, zero `unsafe` above one audited HAL crate.** Unsafe code is
  confined to a single hardware-abstraction crate that is reviewed as a unit;
  everything above it is safe Rust.
- **Formally verified leaves.** Selected components are proved with Kani, and the
  harness counts are pinned in CI - the proof set cannot silently shrink.
- **Boots two architectures on every push.** `x86_64` and `aarch64`, on every
  commit.
- **Fails closed.** The boot does not report success unless the full cumulative
  self-test marker chain prints over serial. A missing marker is a failed boot,
  not a warning.

That last property is the one worth internalizing: correctness is enforced by
construction and checked on every push, so a regression cannot ship quietly.

## Current status - read this before planning against it

Yuva's own README states its limits in uppercase, and this page repeats them
rather than softening them:

> [!IMPORTANT]
> **Live inference is MOCK. Learning is DORMANT** (gate-not-met). The kernel
> reports its own status in honesty tokens over serial rather than implying a
> capability it does not have.

So Yuva today is a verified boot, a verified kernel substrate, and an honest
report of what is not switched on. It is **not** a runtime you can deploy an
agent onto today, and no page here will tell you otherwise. If you need to run an
agent now, that is [Namzu](what-is-namzu.md) on Node.

## What this means for you

| If you want to | Use |
|---|---|
| Run an agent today | [Namzu](what-is-namzu.md) - `@namzu/sdk` on Node 20+ |
| Understand the sovereignty argument | This page |
| Track when Yuva can host workloads | The honesty tokens are the signal; they change when the gate is met |

## Next steps

- [What Namzu is](what-is-namzu.md) - the layer above, and the one you can use now.
- [Agent identity and capabilities](agent-identity-and-capabilities.md) - the
  authorisation model both layers enforce.
