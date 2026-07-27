Every guarantee you make about an agent — that it is isolated, that its memory is
private, that its actions are recorded — is only as strong as the layer enforcing
it. If that layer belongs to somebody else, the guarantee is a rental agreement.

**Yuva is Cogitave's answer to that.** It is a from-scratch, agent-native
sovereign kernel and micro-VMM, written in `no_std` Rust, built to own the
hardware it runs on rather than to sit as a process inside another operating
system.

This module is about *why* that is worth doing and *how* the claim is made
checkable. It is not a hands-on module, and that is deliberate — see the status
note below.

## The layering

Yuva is a different layer from the kernel you used in the previous module, and the
two are not one stack:

| | Namzu | Yuva |
| --- | --- | --- |
| Language | TypeScript | `no_std` Rust |
| You get it from | npm | source; it boots on hardware |
| Runs | on Node | as the machine |
| Use it today | Yes | Not to host workloads — see below |

## Status: read this before planning against it

Yuva reports its own limits rather than implying capability it does not have. Its
README states them in uppercase, and this module repeats them rather than
softening them.

> [!IMPORTANT]
> **Live inference is MOCK. Learning is DORMANT** (gate-not-met). Yuva today is a
> verified boot and a verified kernel substrate — it is **not** a runtime you can
> deploy an agent onto. If you want to run an agent now, that is Namzu on Node.

## What you will get from this module

Not a running agent — an accurate model of what a sovereign kernel buys, what
"verified" means when someone claims it, and how to read Yuva's own honesty
signals.
