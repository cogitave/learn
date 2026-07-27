Every Diyar edge boots from exactly one signed document that describes the hardware it drives - not a hard-coded build, and not a per-customer fork. This unit covers what that document configures, how the edge enforces it before doing anything else, and how the same platform reaches different field hardware through one narrow seam.

## One signed document, loaded at boot

A **device profile** is an Ed25519-signed JSON document, one per solution, that parametrically configures the edge (`edge-app`) at startup. It is not application config in the ordinary sense: the profile decides measurement conditions and safety-relevant pin maps that end up inside the evidence record, so Diyar signs it with the same detached-signature primitive it uses for its other signed documents (the update manifest, the license, the roster).

The profile is identified by a DTMI-style id and a monotonic revision, for example `profile_id: "diyar:profile:ispm15-kiln;1"` at `revision: 1`. `profile_id` must parse as `diyar:profile:<name>;<major>` - the trailing `;<major>` is a real major-version boundary, not decoration - and `revision` is a monotonic anti-rollback counter.

## What it configures

| Section | What it names |
| --- | --- |
| `channels[]` | one entry per sensor: id, ADC index/mux or protocol address, kind (probe, cold junction, ambient, disabled), unit, calibration, a plausibility band |
| `actuators[]` | one entry per output: id, role (`heat_source`, `airflow`, `indicator`), pin or protocol write target, and a `fail_safe: deenergized` default |
| `safety` | the absolute safety limit (for ISPM-15, an over-temperature ceiling) and the maximum allowed rate of change |
| `process` | the process-rule parameters (target, hold count, difference threshold, sampling interval, max steps) |
| `verdict_binding` | which verdict engine this profile names, and how its channels map onto that engine's expected input (the next unit covers what a profile is and is not allowed to name here) |
| `workflow` / `capabilities` | ordered phase ids, and which contract operations this product exposes |

The profile itself lives as `profile.json` inside an app package directory named by `DIYAR_APP_DIR` - the next unit but one covers the other two signed documents that sit next to it.

## Signing and boot refusal

`edge-app` parses the profile with strict serde (`deny_unknown_fields` - an unrecognized field is a load error, never silently ignored), verifies its Ed25519 signature over a domain-tagged preimage, and checks the revision. Any unverifiable or invalid profile is a **loud refuse-to-start**, not a degraded run. The rule is stated directly: an app package directory that is set but not fully present or verifiable must not boot.

This is the same posture as the `DIYAR_HAL=real` gate for direct hardware: a real backend requires a valid signed device profile before it will start at all. The edge also cross-checks the profile's channel count against the compiled-in constant its verdict engine expects, so a profile that doesn't match the hardware it claims to describe is rejected before a single reading is taken.

> [!NOTE]
> An embedded default/simulation profile with today's exact values ships with the edge, so existing tests stay green without any signing infrastructure. An unsigned profile is only ever accepted behind an explicit, loud insecure-dev escape hatch - never on a path that could reach production hardware.

## Append-only evolution within a major

A profile's `profile_id` major is a compatibility boundary. Moving to the next `revision` inside the same major is allowed in only one direction: **channels and actuators may be appended, never removed or renamed.** This is enforced in `validate()`, not by convention - the check compares the previous and next profile and rejects:

- a changed `profile_id` presented as an upgrade (that is a new profile, not an upgrade);
- a `revision` that does not strictly increase;
- a channel that was removed;
- a channel or actuator whose index/kind/role/offset changed in place.

Practically: a physical rewire that adds a probe is a new revision of the same profile. Renumbering or dropping a probe requires a new profile major, and reusing an old `profile_id` to mean something structurally different is refused outright.

## The HAL seam: the same core, different wiring

A new physical device configuration is a signed profile, not a fork of the codebase. Above the profile, everything the measurement engine and safety logic depend on comes through three narrow traits - the HAL seam:

```rust
trait TempSource { fn sample(&mut self) -> Result<ReadingSet, HalError>; } // one acquisition sweep
trait RelayBank  { fn set(&mut self, relay: Relay, energized: bool); fn de_energize_all(&mut self); }
trait MonotonicClock { /* timing independent of wall clock */ }
```

A timeout or a bad read surfaces as a typed `HalError`, never stale data quietly reused. Today's implementors are direct hardware (an SPI ADC and GPIO relays) plus protocol-backed field devices reached over **Modbus** (TCP and RTU) - each is just another pair of `TempSource`/`RelayBank` implementors behind the same seam. Nothing above the HAL - the measurement engine, the safety typestate, the evidence journal, the verdict oracle - changes when the transport changes.

## Field-bus transports and the mandatory watchdog

When a profile drives a field device instead of direct hardware, the signed profile carries an additional `transport` block naming the protocol, the connection parameters, and how each profile channel/actuator maps onto a register or coil. A Modbus RTU example:

```json
{
  "protocol": "modbus_rtu",
  "connection": {
    "path": "/dev/ttyUSB0",
    "baud_rate": 19200,
    "unit_id": 1,
    "request_timeout_ms": 1000
  },
  "channels": {
    "t1": { "register": "input", "address": 100, "data_type": "i16", "scale": 0.1 }
  },
  "actuators": {
    "heater": { "target": "coil", "address": 1, "energized_value": 1 }
  },
  "watchdog": {
    "register": "holding", "address": 900, "period_ms": 1000, "expiry_ms": 3000
  }
}
```

> [!WARNING]
> A lost network or serial link is comms loss: the edge cannot guarantee its "off" command ever arrives. Profile validation **rejects** any Modbus transport that actuates a `heat_source` without a `watchdog` block - the field device itself must de-energize the output if it stops seeing a heartbeat within `expiry_ms`. This is a load-time refusal, not optional configuration.

`request_timeout_ms` is mandatory for the same reason: a hung read has to surface as a fault that cuts the heater, never as a stale value fed into a verdict.

## What is not yet field-validated

Provisioning a field-bus device is not the same as running it against real equipment. The boot preflight for a Modbus (TCP or RTU) transport checks - without a physical device attached - that the profile is present, every non-disabled channel is bound, and no actuator role collides on the map. Having confirmed the wiring is complete, the edge still exits with status 2: the networked run path stays gated until a real field device's comms-loss watchdog and register map are validated on the bench. This is the same gate `DIYAR_HAL=real` applies to direct hardware pending hardware characterization: a signed profile makes a device's *configuration* real, but it does not by itself certify a *run* on real hardware.
