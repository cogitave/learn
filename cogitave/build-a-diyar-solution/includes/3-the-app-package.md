What ships to a device is not code; it is three signed documents and a firmware table that decides what they are allowed to mean together. This unit covers the package shape, the permission tiers, and the offline computation that turns three signatures into one authority.

## Two artifact classes

Diyar draws one hard line: certified logic ships only inside the signed static binary (class A - the verdict engines from the previous unit, the safety typestate, the evidence codec), and everything else ships as configuration that *selects among it* (class B - the app package). A compliance device that could be taught new behavior by a file it downloads would have no certifiable behavior at all - the same split a safety PLC makes between its certified logic and its configuration.

## A package is a directory of three signed documents

The unit of deployment is the directory named by `DIYAR_APP_DIR`. The older, profile-only `DIYAR_PROFILE_PATH` env var is retired, with no compatibility shim. The directory holds exactly three files, each a JSON payload with a detached signature under its own domain-separation tag, each signed by a **different key**:

| File | Type | Signing key |
| --- | --- | --- |
| `manifest.json` | `SignedAppManifest` | the app publisher's key |
| `grant.json` | `SignedAppGrant` | Diyar's authority key - a separate key from the manifest |
| `profile.json` | `SignedDeviceProfile` | the profile key (the device profile from the earlier units, unchanged) |

There is no archive entry point, no interpreter, and no code anywhere in the package.

## Zero evaluable constructs

The manifest is data, not a program. It contains no generic JSON value type, no expression string, no template with substitution, no regex, no URL that is ever fetched, no condition, and no arithmetic - the only way it refers to behavior is by *naming* an entry in the `CERTIFIED_ENGINES` table from the previous unit. This is enforced, not just asserted: a test greps the manifest type's declaration for the tokens `Value`, `expression`, `template`, `regex`, `url`, `script`, `condition`, and `eval`, and every document uses strict, unknown-field-rejecting parsing. The one free-shaped field, `labels`, is a flat string table with a bounded key charset and value length - nowhere for an expression to hide.

## Three tiers, none of them implied by another

```rust
enum Capability { Observe, Operate, Actuate(ActuateScope) }
struct ActuateScope { role: ActuatorRole, index: u8 }
```

- **OBSERVE** - read signals.
- **OPERATE** - non-hazardous state: UI, reports, setpoint *proposals*, export.
- **ACTUATE** - command hazardous energy, scoped to a specific actuator role and index.

The tiers are deliberately **not implicative**: holding ACTUATE does not imply OBSERVE, and holding one tier grants nothing in another. Membership in each tier is explicit, which keeps the authority computation a plain set intersection with no precedence rule to get wrong. Adding a fourth tier is a visible act - a test pins the tier set, and an exhaustive match over it fails to compile if a variant is added without being handled everywhere.

## Authority is an offline intersection: A n B n C

```rust
pub fn effective_authority(
    manifest: &AppManifest, grant: &AppGrant, profile: &DeviceProfile,
    device: &DeviceIdentity, now_unix_s: u64,
) -> Result<AuthoritySet, AuthorityError>
```

This function is pure - no I/O, no network, no clock of its own (the time is injected) - so a device that has never reached the cloud computes the exact same answer from the three signatures alone. It runs in order, fail-closed:

1. **grant freshness** - the current time must fall inside `[issued_at, expires_at)`, within one declared clock-skew allowance;
2. **scope binds this install** - the app id and app version must match exactly, the device type must be listed, the tenant must match enrollment, and the device id must be listed when the grant narrows to specific devices;
3. **candidate = grant n manifest** - B n A: what the publisher's manifest *requests*, intersected with what Diyar's grant *allows*;
4. **tier C** - every surviving Actuate capability is additionally checked against the firmware-compiled actuation allowlist, below;
5. an **empty result is a hard refusal** (`NoAuthority`) - the device does not fall back to running the app read-only.

**A is a ceiling, never a grant.** An app that requests less than it was granted gets less; an app whose publisher edits the manifest to request *more* gains nothing, because the grant is a document only Diyar's offline key can sign - the same property a mobile OS's provisioning profile has over an app's own entitlements request. Revocation is two-sided: a monotonic sequence floor persisted on the device means a captured older grant cannot be replayed after a narrowing, and `expires_at` freshness means a device that goes dark loses an app's authority offline, with no cloud round trip needed.

## Tier C: a firmware-compiled actuation allowlist

Holding ACTUATE in both the manifest and the grant is still not enough to reach hazardous energy. A third table, compiled into the signed binary, has to name the exact pairing:

```rust
pub const CERTIFIED_ACTUATIONS: &[ActuationEntry] = &[ActuationEntry {
    app_id: "diyar.app.ispm15", role: ActuatorRole::HeatSource, index: 0,
}];
```

This table is linked into the binary as constant data - there is no file, environment variable, profile field, manifest field, grant field, or cloud message that can add to it, because the device has no loader and no plugin path for it to travel through. The production authority computation takes no allowlist parameter at all; it reads the constant directly, so no caller can pass it a wider table. An actuation that is requested and granted but is not in this table is a hard `ActuationNotCertified` refusal at activation - deliberately not a silent drop, because an app that looks installed but cannot do its job is the worse failure.

The table is keyed by app id alone, not by app id and version - a deliberate choice: version-pinning here would turn every app patch into a firmware release. Version-level control belongs to the grant instead, which is revocable, expiring, and sequence-floored.

## How each tier is actually enforced

| Tier | Enforcement point | Mechanism |
| --- | --- | --- |
| OBSERVE | telemetry/reading promotion | a signal not listed in the manifest is never promoted |
| OPERATE | HTTP/kiosk request handling | checked at request time |
| ACTUATE | construction of the safety typestate | a value that does not exist |

ACTUATE's enforcement is structural rather than a runtime branch: without a granted, certified actuation handle, the composition root simply never constructs the armed safety state and never hands over the relay bank - there is nothing to check because there is nothing to actuate with. An app that holds only OBSERVE/OPERATE authority is, on this build, a device that will not start a session at all - an honest refusal rather than a session that silently never heats while still writing evidence.

## What "deploying" means versus what "enabling actuation" means

Signing and placing three JSON documents in `DIYAR_APP_DIR` is a complete, self-contained deployment - no build, no compile step, no review of application logic. **Certifying a new app's ability to energize hazardous output is a different, and much heavier, act**: it requires an entry in the firmware-compiled `CERTIFIED_ACTUATIONS` table, which means a new signed binary on the existing OTA train, which means a firmware release and the certification event that goes with it. Those are deliberately two different costs, because they are two different classes of risk.

> [!IMPORTANT]
> A device offline past its grant's `expires_at` loses that app's authority - correct as a security property, but an availability trade an operator has to size deliberately: expiry should be set long relative to the worst credible offline window, with a loud local alarm well before it lapses.
