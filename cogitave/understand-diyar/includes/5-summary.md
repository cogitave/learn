You can now explain what Cogitave Diyar is, why it is built edge-autonomous,
and where the platform stops and a solution begins.

In this module, you:

- Explained why Diyar is edge-autonomous: the device is the sole authority over
  safety and evidence, and a run completes the whole loop - start, sweep,
  evaluate, journal, drain, reconcile - with the network, the cloud, and the
  operator's phone all absent.
- Separated the platform (enrollment, tenancy, the evidence lifecycle, signed
  updates, an audited console, a fail-safe actuation model - the same for every
  industry) from a solution (a certified verdict engine plus a signed device
  profile), and placed ISPM-15 correctly as the first solution, not the
  product.
- Read the `diyar:<layer>:<name>;<major>` id grammar used across every
  solution, engine, profile, and app in the platform.
- Walked the three architectural zones - the edge (sole actuation and evidence
  authority), the cloud/on-prem control plane (requests and mirrors, never
  actuates), and the client surfaces - and can state precisely which one can
  ever energize hardware.
- Learned, honestly, which parts are still early: the kiosk and web portal
  ship as minimal stubs today, and `DIYAR_HAL=real` refuses to start pending
  hardware-in-the-loop validation.

## Next steps

- @cogitave.learn.diyar-safety-and-evidence - the next module in
  **Introduction to Cogitave Diyar**, on the layered safety design behind
  de-energize-to-trip and how a single reading becomes tamper-evident
  evidence.
- Keep the platform/solution split and the `diyar:<layer>:<name>;<major>` id
  grammar in mind - they carry through everything the rest of this path
  covers.
