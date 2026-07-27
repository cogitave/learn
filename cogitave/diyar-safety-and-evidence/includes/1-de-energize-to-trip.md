Cogitave Diyar's edge device drives a kilowatt-class heater, so its safety design starts from one rule and backs it with four layers. This unit covers the rule, the four layers, and the extra requirement that applies the moment a heat output moves onto a field bus.

## The core rule: de-energize-to-trip

The heater is a kilowatt-class resistive/contactor load: left uncontrolled, it is a fire and equipment-damage hazard. Diyar's design rule is **de-energize-to-trip**: the safe state is always heater OFF, and any loss of control, evidence, or confidence must fall back to that state. Nothing in the stack is allowed to treat "keep heating" as the default when something is uncertain.

## What the layers have to survive

The layered design exists because no single failure mode is allowed to leave the heater energized without a live control loop behind it:

- **Thermal runaway** — the heater keeps climbing past target. A minimum-hold compliance rule only checks that a floor was met, and a minimum can never detect a runaway, because hotter always satisfies it. A separate, absolute ceiling is required.
- **A wedged control loop** — the software responsible for cutting the heater stops running (a hung syscall, a deadlock, priority inversion) while the relay is still energized. Software checked *inside* that same loop cannot save itself.
- **Blind acquisition** — every temperature channel faults at once, so the system no longer knows how hot it is. Continuing to heat blind is unsafe.
- **Evidence loss** — a journal write fails. A run that can no longer be proven must not continue as if it were still valid.
- **Power interruption** — the CPU reboots mid-run. The relay has to fall to OFF by wiring, not by software re-asserting it after restart.

## Layer 1 — independent hardware thermal cutoff (mandatory)

A thermal fuse or bimetallic thermal limiter, wired **in series with the heater contactor**, sized below the damage threshold and above the maximum legitimate process temperature. It opens on temperature **alone** — no software, no firmware, and no failure mode it shares with the CPU. This is the layer that survives a fully wedged processor, and the design states plainly that the software interlock must never be the only thing standing between a runaway and a fire.

## Layer 2 — hardware watchdog and fail-safe wiring (required)

A hardware watchdog (the board's watchdog via systemd's `WatchdogSec`) resets the box if the application stops petting it. The edge feeds this watchdog from a background task that runs independently of the worker thread, and it deliberately **withholds** the heartbeat whenever a running session has not made progress within a configured stall window — so even a hung async runtime stops the pings, and the reset follows. On reset, the relay-driving GPIO returns to a high-impedance input, and the wiring is built so that state resolves to heater-OFF.

> [!WARNING]
> The watchdog is still gated off in the shipped edge service template as of this writing — it needs `NotifyAccess=main` plus a `WatchdogSec` deadline tuned on the target hardware, because an untuned value can reboot-loop the box. Enabling it is a required bring-up step, not something that ships turned on by default.

## Layer 3 — the software typestate interlock

Above the two mandatory hardware layers sits a software interlock that makes "heater energized without a live control loop" unrepresentable in the type system:

- The heater can only be energized through `Idle -> Armed -> Heating`; nothing sets the raw relay directly.
- `Heating` demands a heartbeat within its deadline, or it releases the relay.
- The same guard enforces an absolute over-temperature ceiling, set from the equipment's thermal model — **not** the process's minimum-hold target, which is a minimum and cannot bound a maximum.
- If a ceiling is configured but no channel has a trustworthy reading this sweep, the interlock trips rather than continuing to heat blind.
- A ceiling is validated at construction: a non-positive, infinite, or NaN value — any of which could never trip — is rejected before it can be used.
- Dropping the heating handle releases the relay, so a panic or task cancellation de-energizes the heater. This backstop depends on unwinding panics rather than aborting them, and the workspace is built to enforce that.

## Layer 4 — worker enforcement on every exit path

The measurement worker owns the relay exclusively and drives it only through the layer-3 interlock, cutting the heater on every way a session can end:

| What happens | Result |
|---|---|
| Over-temperature ceiling breached | Heater cut, run interrupted |
| Control loop stalled (a step arrives late) | Heater cut, run interrupted |
| Anomaly monitor trips mid-session | Heater cut immediately, run interrupted |
| A standing anomaly flag exists at start | Never energized |
| A channel reads a hard fault | Run aborted, heater de-energized |
| No trustworthy channel exists under a ceiling | Heater cut, run interrupted |
| Acquisition hardware error | Run aborted, heater de-energized |
| Journal write failure | Heater de-energized |
| Normal completion or operator stop | Heater de-energized |
| Panic or task cancellation | Heater de-energized |

The safety check runs **before** journaling or publishing on every step, so heat is cut before any operation that could block. A safety cut always forces the run to an interrupted state and blocks a pass verdict — the verdict of a run whose heat was cut for safety is never trustworthy.

## The comms-loss watchdog: a requirement for networked heat outputs

When a heat output is driven over a field bus (Modbus RTU or TCP) rather than a local relay, a lost cable is comms loss: the edge can no longer guarantee that an "off" command reaches the device. So de-energize-to-trip gets a field-side leg. Profile validation **rejects** a transport that actuates a heat source unless it declares a watchdog:

```json
{
  "actuators": {
    "heater": { "target": "coil", "address": 1, "energized_value": 1 }
  },
  "watchdog": {
    "register": "holding", "address": 900, "period_ms": 1000, "expiry_ms": 3000
  }
}
```

The edge writes an incrementing heartbeat to the watchdog register every `period_ms`; the field device itself must de-energize the heat output if it does not see a refresh within `expiry_ms` (which must exceed `period_ms`, so the device has slack to observe one before self-cutting). The absolute over-temperature cutout stays on the field device too, as an independent backstop.

> [!NOTE]
> A device configured this way still won't run against real field hardware today. The boot preflight checks the wiring — profile present, every channel bound, no actuator role collision — prints what it found, and then **exits 2**: the run path stays gated until a bench validates the device's comms-loss watchdog and register map against real hardware.

## Known limitation: why the hardware layers are not optional

The layer-3/4 heartbeat is cooperative, not an independent watchdog. It is only re-checked when the loop reaches its next guard call, so it catches a loop that is *slow but still iterating* — it does **not** catch a thread parked inside a blocking call, such as a wedged sensor read or a stalled journal write (a SQLite lock, an fsync stall, a full disk). In either case the loop never returns to the guard, the drop-based release never runs, and the relay stays energized with no time bound. That gap is exactly what the hardware layers exist to close: a hardware watchdog resets a box whose software has stopped responding at all, and the independent thermal cutoff opens on temperature with no dependency on the CPU whatsoever. A software heartbeat that can only fire from inside the loop it guards is not, by itself, a safe stall detector.
