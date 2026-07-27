The process rule that decides pass or fail - a threshold hold, a pressure band, a cumulative-lethality integral - is not welded into the session loop. It plugs in through a narrow trait, and only a fixed, firmware-compiled list of engines may ever be named by a signed profile.

## The problem a profile alone could not solve

A device profile can describe new hardware, but until recently it could not describe a new *process*. The verdict logic was invoked directly by the session loop, and profile validation matched exactly one hard-coded engine id. A product whose hardware arrived with its own compliance rule had nowhere to attach it - signing a profile was not enough, because there was no seam to sign into.

## A narrow port, owned by the consumer

The fix applies dependency inversion at the measurement engine, not at the certified oracle:

```rust
pub trait VerdictEngine {
    fn push(&mut self, reading: &[f64]) -> StepVerdict;
    fn steps(&self) -> u32;
}
```

`VerdictEngine` lives in `edge-measurement-engine` - the orchestrator that needs it - not in a frozen, byte-parity engine crate. That placement is deliberate: a local trait can be implemented for a foreign type, so a frozen, byte-parity product engine sitting in its own crate gets a pure forwarding `impl VerdictEngine`, and that frozen crate is untouched by the change. Putting the trait the other way around - inside the frozen crate, with the orchestrator depending on it - was considered and rejected: it would grow a zero-dependency, byte-parity crate an abstraction shaped by a future consumer's needs, and it would couple every future engine to that crate.

The engine is handed in as a **factory**, not a shared instance - it carries per-session state (step and hold counters), and each session gets a fresh one so no run's progress leaks into the next.

Everything above the rule is unchanged and inherited by any engine that plugs into this seam: acquisition cadence, stop polling, fail-safe fault abort, the journal sink, and bounded step counts - and, from the worker, the frozen `Idle -> Armed -> Heating` safety typestate, the per-step guard, the quarantine cross-check, and every de-energize path. None of the safety logic moved; only where the rule comes from did.

## The fail-closed certified registry

Signing a profile is not enough to introduce a new rule. Profile validation checks the named engine against a table compiled into the binary:

```rust
pub const CERTIFIED_ENGINES: &[EngineSpec] = &[
    EngineSpec {
        id: "diyar:engine:threshold-hold;1",
        exact_channels: None, // a generic engine binds its inputs by name
        // ...
    },
    // more certified engines follow, each with a stable id
];
```

A signed profile naming an id this build does not recognize is rejected at load, and where an engine declares a required input width (`exact_channels`), that too is checked along with its id. Onboarding a new process rule is therefore three separate, explicit acts:

1. an entry in `CERTIFIED_ENGINES`,
2. a `VerdictEngine` implementation,
3. that product's own certification evidence - its own parity oracle.

A compromised or over-eager signer cannot put an uncertified verdict rule into production by signing a profile alone; the registry is compiled into the binary, and adding to it is a firmware release.

## Product engines: a frozen rule in its own crate

Some `CERTIFIED_ENGINES` entries are **product engines**. Each wraps one industry's own rule - often a frozen regulatory oracle it must reproduce byte for byte - and lives in its own crate, separate from the generic library below, because it exists to preserve one specific certified behavior rather than to be reused. A product engine's verdict trace, canonical evidence bytes, and chain head are held stable, and socketing it in behind the trait must not perturb them: a test asserts the certified path yields identical outcomes through both the old direct-construction entry point and the new socketed one. Diyar's first product engine is the ISPM-15 phytosanitary rule, worked through end to end in its own dedicated unit rather than here.

## The generic engines: a product with no new code

Alongside any product engines, the registry carries a small library of **generic** engines - certified code, compiled into the same protected crate, parameterized entirely by typed profile data:

| Engine | What it does |
| --- | --- |
| `diyar:engine:telemetry-only;1` | records every step; has no pass condition, `passed` is always `false` |
| `diyar:engine:threshold-hold;1` | passes after N consecutive in-band samples on a bound signal |
| `diyar:engine:cumulative-dwell-lethality;1` | accumulates a lethal-rate integral over a run (for example steam F0, or a plain hold-above-threshold) |

Because these are already certified and already compiled in, a genuinely different product can be onboarded as **pure signed data** - a device profile and its app package - with no new crate and no new code. The platform's own stated, falsifiable bar for this claim: if roughly 95 of 100 product types cannot be onboarded this way, the design has failed.

> [!NOTE]
> `pressure-hold` (a pressure band held over Modbus TCP), `coldroom-hold` (a temperature band with no heat actuator at all), and `steam-sterilizer-f0` (an F0 lethality target) are the repository's internal proof fixtures for this claim - each a signed profile and app package, no product crate, run through a real session loop into a real evidence store. They are test/example fixtures that exercise the generic-engine pattern, not customer case studies or field-proven deployments.

A parameterized engine is still not an escape hatch for an arbitrary rule: everything a profile hands an engine is a closed, tagged enum of typed scalars - there is no expression language, no formula string, no operator, and no field that references another field. The only way to extend what a generic engine can express is a new enum *variant*, which is a firmware event like any other `CERTIFIED_ENGINES` addition. Every params block is validated twice - once when the profile loads, once again in the engine's own constructor - so a caller that bypasses profile validation still cannot build a malformed engine.

## The reserved-id rule against laundering

Because a generic engine serves many products, the evidence identity it stamps into its own records (`solution_id`) has to come from profile data, not a compiled constant. That opens a path a fixed-id engine never had to worry about: a signed profile could name a generic engine and stamp a reserved product id into its own evidence, producing records a downstream verifier might mistake for a certified product engine's output.

The registry closes this in both directions: every **fixed** id in `CERTIFIED_ENGINES` - a product engine's own id - is reserved, and a generic profile that claims one is refused at load. Symmetrically, a product engine owns its id and no profile may rename it. A regulator reading a solution id in the evidence chain can trust it names what it says it names.
