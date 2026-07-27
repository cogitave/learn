Diyar separates what every regulated device deployment needs from what a specific industry adds on top. This unit covers that split, what a solution actually is, and the identifier grammar that ties the two together.

## What the platform owns

Diyar the platform owns the parts every regulated device deployment needs, regardless of industry:

- Enrollment and identity
- Fleet and tenancy
- A tamper-evident evidence lifecycle
- Signed updates
- An audited remote console
- A fail-safe actuation model

These don't change from one industry to the next. A device treating wood packaging and a device holding a cold room at temperature both enroll the same way, both get updated over the same signed pipeline, and both write into the same kind of tamper-evident evidence chain.

## What a solution adds

What a specific industry needs on top of the platform is a **solution**: a certified verdict engine plus the signed device profile that drives it.

- **Solutions plug in; they are not forks.** A device's channels, actuators, safety limits, process parameters, field-bus binding, and verdict rule all arrive in one signed **Device Profile**. Adapting the platform to a different machine — or a different process with its own compliance rule — is configuration plus a certified engine, not a copy of the codebase.
- **A profile cannot introduce a rule.** It may only *name* an engine the running build is already certified to run. Signing a profile is not, by itself, enough to make a device do something new.

## Solutions plug in; they are not the product

A solution lives on the industry side of the split, and the product's own documentation is explicit about keeping it there: a solution is *added to a deployment*, not built into the platform. Each product engine lives in its own crate and is destined for its own repository, so the platform can be understood, updated, and audited without reference to any one industry's rule.

The engineering record behind this split states the pivot directly: Diyar is not a single-product system. It is a platform for devices — the hub knows which solution runs on a device and under which security posture; the solution carries the domain. The platform stays generic; the domain rides in on a certified engine and a signed profile.

Diyar does ship concrete, certified solutions this way. The first and most mature is phytosanitary heat treatment (ISPM-15); it has its own dedicated unit and is not used as the worked example here.

> [!NOTE]
> The repository also carries a small number of example fixtures — `pressure-hold`, `steam-sterilizer-f0`, `coldroom-hold` — used internally to prove that the generic engine pattern actually works across different, non-thermal processes. These are test fixtures, not customer case studies: each is onboarded as pure signed data (a profile plus an app package, no new engine code), which is the proof that the platform/solution boundary holds rather than an assertion of it.

## One id grammar across every layer

Every layer of Diyar names itself with a single, uniformly-parsed grammar:

```text
diyar:<layer>:<name>;<major>
```

For example:

```text
diyar:engine:threshold-hold;1
diyar:app:pressure-hold;1
diyar:profile:<name>;1
```

Every layer — and the cloud — validates ids through one shared parser rather than several bespoke formats, so an engine id, an app id, and a profile id are all held to the same rule (allowed name characters, a required major-version field) instead of drifting apart as the platform grows. The trailing `;<major>` is a real major-version boundary, not decoration.

## Why the split matters

For an integrator evaluating Diyar, the practical consequence is: adding a new regulated process to the platform is not a fork of Diyar. It is a new signed Device Profile naming a certified engine, plus — if no existing certified engine fits — a new engine added to the platform's certified library, itself a firmware release and a certification event. The platform's enrollment, evidence lifecycle, update pipeline, and remote console do not change per solution.

> [!WARNING]
> None of this implies Diyar currently holds any functional-safety (SIL) certification — none exists yet. "Certified engine" here describes the platform's internal discipline (a fail-closed table of engines a build is permitted to run), not a third-party safety certification of the platform itself.
