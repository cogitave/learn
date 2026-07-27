Cogitave Massar is the guardian agent that lets an authorized operator open a terminal on a customer device with no inbound port, no VPN, and no shell left standing between sessions. This module builds the model you need before you evaluate or install it: what Massar is, why it is built the way it is, and exactly what it does and does not do yet.

## What Massar is

Massar is a small, cross-platform agent installed on a customer-owned device. It is the guardian layer of the Cogitave cloud: once running, it dials **out** to the Diyar console broker, and when an authorized operator opens a session, it bridges an interactive terminal - a real PTY running a real shell - back over that one outbound connection.

The same binary runs on both operating systems Massar supports today:

| Platform | PTY implementation | Status |
| --- | --- | --- |
| Windows | ConPTY | Proven end-to-end |
| Linux | openpty | Proven end-to-end |

One codebase, one binary per OS, the same wire protocol on both.

## Who this module is for

You are likely reading this because you are one of:

- An **engineer or integrator** deciding whether Massar's install and network model fit a fleet of devices you are responsible for.
- A **compliance owner** who needs to state precisely what access installing Massar grants, to whom, and how that access is bounded.

You do not need a device or a Cogitave account to follow this module - it teaches the model, not the installation steps.

## The one thing Massar does

Strip away everything else, and Massar does one thing: it holds a single outbound WebSocket connection to the Diyar console broker, and when told to, it opens a PTY, attaches a shell, and streams bytes in both directions until the session ends.

Three properties fall out of that one job, and each gets its own unit in this module:

- **It dials out.** The agent never accepts an inbound connection or listens on a socket - covered in Unit 2.
- **It bridges a real terminal.** When a session opens, an actual shell runs on the device - not a restricted command runner - over a protocol split into control frames and terminal bytes, covered in Unit 3.
- **It holds no standing shell.** A PTY exists only for the duration of an explicitly opened, TTL-bounded session, gated by authorization on the Diyar side - covered in Unit 4.

> [!NOTE]
> Massar itself does not decide *who* is allowed to open a session against a device. That decision - and the audit trail for every session that is opened - lives on the Diyar side. This module tells you what Massar is built to do; Unit 4 covers where that authority boundary sits.

## Where Massar sits in the Cogitave cloud

`massar-agent` is the device end of a remote-console feature. The console broker - the cloud end it dials - lives in Diyar, at a fixed path for agents (`/api/v1/console/agent`) and a fixed path for operators (`/api/v1/devices/{id}/console`). An operator never talks to the device directly; every byte crosses the broker, and the browser terminal (built on xterm.js) is what renders the operator's side of the session.

## What this module covers, unit by unit

1. **Why dial out** - the outbound-only network model, and why it needs no inbound port and no VPN.
2. **How a session works** - the three parties in a session and the wire protocol that connects them.
3. **The security and consent model** - how a device authenticates, how an operator is authorized, and an honest account of what is shipped versus what is still a design.

By the end of this module you should be able to describe, precisely, what installing Massar on a device exposes - and what it deliberately does not.
