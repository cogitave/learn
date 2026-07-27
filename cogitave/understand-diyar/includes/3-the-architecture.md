Diyar's architecture keeps one rule absolute: the edge is the only thing that can ever actuate. Everything else — cloud, on-prem gateway, client surfaces — sits around that boundary without ever crossing it.

## The edge

The edge is a single static aarch64 binary running on the field device, deployed under systemd. It is:

- The **sole actuation authority** — nothing else in the system holds a primitive that can energize hardware.
- The **sole evidence authority** — it owns the local, tamper-evident hash chain that every reading is journaled into before anything is published.
- Fully capable of running **offline** — a treatment runs to completion with no cloud, no network, and no operator phone reachable.

Underneath the edge binary, a hardware abstraction layer (`TempSource` / `RelayBank` / `MonotonicClock`) is the seam a new physical device implements; the `VerdictEngine` trait is the seam a new solution implements (Unit 2). The edge also hosts a local MCP agent surface, and — where deployed — a loopback `agent-gateway` process fronting the same REST API a human operator uses, gated by an operating-mode state machine (Manual by default).

```text
Operator ──┬─ kiosk (LAN)                 ┌──────────────────────────────┐
           ├─ web / mobile ──── signed ──▶│ EDGE  (single aarch64 binary)│
           │                     start    │  • sole actuation authority  │
           └─ web terminal ──▶ massar ───▶│  • local evidence hash chain │
                              (dial-out)  │  • fail-safe interlock       │
   ┌─────────────────────┐   evidence     │  • MCP agent surface (local) │
   │ CLOUD / ON-PREM     │◀── batches ────└──────────────┬───────────────┘
   │  • fleet + shadow   │   (outbox)                    │ HAL seam
   │  • re-derives chain │                    ┌──────────┴──────────┐
   │  • RLS multi-tenant │                    │ local ADC + relays  │
   │  • never actuates   │                    │ or Modbus TCP / RTU │
   └─────────────────────┘                    └─────────────────────┘
```

> [!IMPORTANT]
> Real hardware acquisition is deliberately gated: `DIYAR_HAL=real` refuses to start pending hardware-in-the-loop characterization of the probe chain (the ADC exposes 8 single-ended inputs, which does not yet reconcile with the platform's wider reading set, and per-channel calibration is a metrology task, not a code default). A physical Modbus field device similarly runs a boot preflight and then stops — exit code 2 — until a bench validates its register map and comms-loss watchdog. Both fail loudly by design rather than guessing at unverified values.

## The cloud / on-prem control plane

The control plane — whether run in the cloud or on an on-prem gateway — owns the registry, enrollment, evidence intake, fleet reconciliation, and dispatch. Its deployable services, as they appear in the platform's own day-2 operations runbook:

| Service | Role |
|---|---|
| `diyar-ingest` | evidence firehose: idempotent, tenant-isolated writes plus tamper gates |
| `diyar-cloud` | control plane: enrollment, fleet, alarms, device shadow |
| `diyar-reconcile` | always-on interior-gap scan; pages on divergence |
| `diyar-dispatch` | drains the notification outbox, delivers signed webhooks |
| `diyar-provision` | converges resource provisioning on a scan loop |

**Authority is one-directional.** In the control plane, the cloud can request, advise, and mirror state — it holds no primitive that energizes anything. The device twin's desired-state is config-class only (things like OTA channel, sampling interval, log level), and there is deliberately no broadcast actuation primitive anywhere in the system: mass remote ignition is the top threat the design guards against.

## Running a site fully disconnected

A site does not have to depend on the public cloud at all. The on-prem gateway bundle (`deploy/compose.gateway.yml`) runs the same control-plane and ingest services against a local TimescaleDB with pgBackRest for point-in-time recovery, Caddy for TLS, `step-ca` as the device certificate authority, and a mutually-authenticated MQTT broker (`rumqttd`, MQTT 3.1.1) for LAN devices. A site can run entirely disconnected from any public cloud this way.

## Client surfaces

Operators reach a device through a kiosk (local, LAN), a web or mobile client (remote, signed start), or an audited terminal session dialed out through Massar — a small on-device agent that opens outward to Diyar's console broker so an operator gets a session with no inbound port and no VPN, and no standing shell outside an explicitly-opened, RBAC-gated, TTL-bounded session.

> [!WARNING]
> The kiosk and web portal are early: each currently ships as a minimal stub, not a full interface. Diyar's client strategy schedules the richer React web interfaces for later build phases, so treat any screenshot of a rich kiosk or portal UI as forward-looking, not current state. The cloud's view of a device is also after-the-fact: it shows evidence that has already synced, not a live view of a running session.

## Extension seams, summarized

Two seams carry all future growth without touching the frozen safety core: the hardware abstraction layer for a new physical device, and the `VerdictEngine` trait for a new certified process rule. Everything from Unit 2 — a new solution, a new device profile — is expressed through one of these two seams.
