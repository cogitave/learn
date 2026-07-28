You can now describe, precisely, how a Diyar device becomes a certified
solution - through signed documents and firmware-compiled registries, not
custom code written per customer.

In this module, you:

- Learned what a signed device profile configures at boot (channels,
  actuators, safety limits, process parameters, verdict binding), why an
  unverifiable or invalid one is a loud refuse-to-start, and why append-only
  evolution only lets a revision add channels or actuators, never rename or
  remove one, within a major version.
- Explained the HAL seam - `TempSource` / `RelayBank` / `MonotonicClock` -
  that lets the same safety-critical core drive local hardware or a Modbus
  (TCP or RTU) field device unchanged, and why a networked heat source without
  a declared watchdog is rejected at load.
- Explained why the `VerdictEngine` trait, not a valid signature alone, is
  what lets a process rule run: a signed profile can only name an engine
  already listed in the firmware-compiled `CERTIFIED_ENGINES` table, and the
  reserved-id rule stops a generic engine from laundering a product engine's
  identity.
- Described the three documents in an app package (manifest, grant, profile),
  why each is deliberately free of any evaluable construct, the three
  non-implicative authority tiers (Observe / Operate / Actuate), and how
  `effective_authority` computes A n B n C offline - plus the
  firmware-compiled `CERTIFIED_ACTUATIONS` allowlist that gates hazardous
  actuation on top of that.
- Walked ISPM-15 end to end as one worked solution built entirely on that
  machinery, why its verdict engine is byte-parity-locked to a frozen
  reference oracle, and the honest limits: no third-party safety certification
  exists yet, and the non-thermal siblings (`pressure-hold`, `coldroom-hold`,
  `steam-sterilizer-f0`) are internal proof fixtures, not customer
  deployments.

That completes the three modules of the "Introduction to Cogitave Diyar"
path: understanding what Diyar is, its safety and evidence model, and now how
a device becomes a certified solution.

## Next steps

- @cogitave.learn.paths.introduction-to-diyar - return to the path to claim
  your trophy.
