ISPM-15 is the first solution built on Diyar, and the most mature - but it is a solution, added to a deployment, not a part of the platform. This unit explains what ISPM-15 is, how it is realized with exactly the profile, engine, and app-package machinery the earlier units taught, and why its verdict engine is deliberately held frozen. Nothing here is a new platform mechanism; it is the generic model with one industry's rule filled in.

## What ISPM-15 is

ISPM-15 is the international phytosanitary standard for wood packaging material - pallets, crates, dunnage - that moves across borders. Its purpose is to stop timber pests from travelling with the wood. The treatment this unit is concerned with is heat treatment:

> The wood's **core** temperature must be brought to at least **56 °C and held there for 30 continuous minutes**.

Every word of that carries weight, and *continuous* most of all. The record has to show that the hold was genuinely unbroken - not that the average was warm enough, and not that 56 °C was touched once and then dipped below it. An inspector reading the evidence afterward is checking exactly that: target reached, and duration held without interruption.

Note the shape of the rule: it is a **minimum-hold**. Hotter and longer always satisfy it. That is precisely why - as the safety unit explained - the compliance rule can never double as the over-temperature protection: a minimum can never bound a maximum, so a separate, absolute ceiling is always required alongside it.

## How it runs on Diyar

ISPM-15 uses the same three-part machinery every Diyar solution uses, with nothing platform-specific added:

- A **signed device profile** describes the hardware - the temperature channels (core probe, cold junction, ambient), the heat-source actuator, the over-temperature ceiling, the field-bus binding if any - and, in its `verdict_binding`, names the engine that decides pass or fail. The profile only *names* the engine; it cannot introduce a rule.
- A **certified verdict engine**, `diyar:engine:ispm15-parity;1`, is the ISPM-15 rule itself. It is a `CERTIFIED_ENGINES` entry compiled into the signed binary, so a signed profile is allowed to name it only because this build is certified to run it. It consumes a fixed-width reading - the historical 15-wide sweep, pinned by `exact_channels` - and returns a per-step verdict.
- An **app package** carries the manifest, the grant, and the profile, and the offline authority intersection decides what the app may do. ISPM-15 is the one solution that commands hazardous energy today, so its `(app_id, HeatSource, 0)` pairing is the real entry in the firmware-compiled `CERTIFIED_ACTUATIONS` allowlist - the tier-C gate the app-package unit described.

The division of labour is worth stating explicitly, because it is the whole point of the platform/solution split:

| Supplied by ISPM-15 (the solution) | Supplied by Diyar (the platform) |
| --- | --- |
| The 56 °C / 30-minute minimum-hold rule | The acquisition cadence and stop polling |
| Its process parameters (target, hold, difference threshold, interval) | The fail-safe `Idle -> Armed -> Heating` typestate |
| Its own parity oracle and certification evidence | The local evidence hash chain and outbox |
| The `treatment` display term in its UI | The re-derivation and quarantine in the cloud |

Everything in the right-hand column is inherited unchanged. ISPM-15 does not fork it, extend it, or configure it away.

> [!NOTE]
> The user-facing word for a run of this solution is *treatment* - that is the ISPM-15 app's own display term. In the platform's own vocabulary and HTTP contract it is just a *run*. The domain word lives in the app; the platform stays product-neutral.

## What a run looks like

An ISPM-15 run is the platform's generic session loop, with the ISPM-15 engine in the socket:

1. An operator starts the run at the kiosk, or remotely with a **signed request** the edge validates locally and may veto - heater actuation is never expressed in the cloud protocol.
2. The edge sweeps its temperature channels on a fixed cadence, energizes the heat source through the fail-safe typestate, and evaluates each step against `diyar:engine:ispm15-parity;1`.
3. Every reading is journaled into the local hash chain **before** it is published, so a power cut or a dropped uplink never costs evidence.
4. The engine tracks the continuous hold and returns per-step verdicts; a safety cut on any step forces the run to an interrupted state and blocks a pass.
5. When the uplink returns, the store-and-forward outbox drains, and the cloud re-derives the chain independently, quarantining anything that does not reconcile.

The guarantee is the platform's, not the solution's: the run completes with the network, the cloud, and the operator's phone all absent.

## Why the engine is frozen

A compliance verdict must not drift. If a firmware refactor, a compiler upgrade, or an innocuous-looking change moved the pass/fail boundary by a fraction of a degree or a single sample, an old certificate and a new one would silently stop meaning the same thing - and nothing outside the box could tell.

So the ISPM-15 engine is **byte-parity locked to a frozen reference oracle**. A parity gate re-derives the oracle's output independently and compares it to the Rust engine byte for byte; property tests and differential fuzzing drive both with the same inputs and fail the build on any divergence. The pin is not one opaque constant but **three independent ones**:

- the verdict trace,
- the canonical evidence bytes,
- the chain head.

A change that happens to preserve one of the three but not the others is still caught. This is why the ISPM-15 rule lives in its own crate rather than in the generic engine library: the generic engines are reusable function blocks parameterized by data, whereas this engine exists to reproduce one fixed certified behavior and must be insulated from the ordinary evolution the rest of the platform undergoes. "Frozen" here is a regulatory constraint, not a compatibility one.

## What it took to make ISPM-15 a certified solution

ISPM-15 did not get a shortcut. It went through the same three explicit acts the verdict-engine unit named for any new process rule, and a signature over the profile satisfies none of them on its own:

1. **An entry in `CERTIFIED_ENGINES`.** `diyar:engine:ispm15-parity;1` is compiled into the signed binary with its required input width. Adding it was a firmware release and a certification event, not a config change.
2. **A `VerdictEngine` implementation.** The frozen oracle is wrapped as a pure forwarding engine behind the trait, so it plugs into the session loop without the platform reaching into its internals.
3. **Its own certification evidence.** ISPM-15 brought its own parity oracle - the reference the frozen engine is held byte-for-byte against - which is what the parity gate checks on every build.

Because ISPM-15 actuates, it needed a fourth thing no non-actuating solution requires: an entry in the firmware-compiled `CERTIFIED_ACTUATIONS` allowlist. That, too, is a firmware and certification event, deliberately heavier than deploying a signed app package.

## One solution among others

ISPM-15 is first and most mature, but it is one solution, not the platform:

- The platform ships **generic engines** - telemetry-only, threshold-hold, cumulative-dwell-lethality - that cover a long tail of non-thermal processes as pure signed data, with no new engine crate. A pressure hold or a cold-room hold needs no ISPM-15 code, and no heat at all.
- ISPM-15's engine lives in-repo today, but is destined for **its own repository** - added to a deployment rather than built into the platform. The platform does not depend on the solution; the solution depends on the platform.
- A few of ISPM-15's fingerprints are still being cleaned out of the shared core, and are documented as such rather than hidden. The `0.0` "skip" sentinel in the reading sweep, for instance, is a **legacy ISPM-15 quirk** kept deliberately from leaking into the platform's generic signal model - one more sign that ISPM-15 is a tenant of the platform, not its foundation.

## Honest limits

State these plainly, because they are part of evaluating the solution:

- **There is no third-party safety certification.** "Certified engine" here is the platform's own internal, fail-closed discipline - the compiled-in `CERTIFIED_ENGINES` and `CERTIFIED_ACTUATIONS` tables a build is permitted to run - not a functional-safety (SIL) certification of ISPM-15 or of Diyar. None exists yet.
- **The heat-safety story is defense-in-depth, not software alone.** ISPM-15 drives a kilowatt-class heater. The de-energize-to-trip typestate is layer 3; a real deployment still requires the independent hardware thermal cutoff and watchdog underneath it. The compliance engine proves *what the process did* - it is not the thing that prevents a fire.
- **The non-thermal siblings are fixtures, not customers.** `pressure-hold`, `steam-sterilizer-f0`, and `coldroom-hold` are internal test/example fixtures that exercise the generic-engine pattern - each a signed profile and app package driven through a real session loop into a real evidence store - not customer case studies or field-proven deployments.
- **Real-hardware acquisition is still gated.** As with the rest of the edge, a real ISPM-15 run against physical probes refuses to start pending hardware-in-the-loop characterization of the probe chain. The gate fails loudly rather than guessing, and a signed profile makes a device's *configuration* real without certifying a *run* on real hardware.

ISPM-15 is where Diyar started, and it is the proof that the platform's profile-plus-engine-plus-package model carries a genuine, regulated, actuating process. It is not, and is not meant to be, the lens through which the rest of the platform is understood.
