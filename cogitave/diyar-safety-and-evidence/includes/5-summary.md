You can now explain how Diyar keeps a kilowatt-class heater safe with no
network connection, and how a single sensor reading becomes evidence an
inspector can trust.

In this module, you:

- Learned the core rule, de-energize-to-trip, and the four layers that back
  it: an independent hardware thermal cutoff (mandatory, survives a wedged
  CPU), a hardware watchdog with fail-safe wiring, the software typestate
  interlock (`Idle -> Armed -> Heating`), and worker enforcement that cuts the
  heater on every exit path - plus the comms-loss watchdog a Modbus-driven
  heat output must declare before profile validation will accept it.
- Explained why a remote start from the cloud or a mobile client is a signed,
  vetoable request the edge alone validates - never a command - and why the
  device shadow's desired state is deliberately config-class only, never
  actuation.
- Traced a reading from the local journal (written before anything is
  published) through the SHA-256 hash chain, the Merkle history tree that
  proves completeness without shipping a whole session's history, and the
  cloud's independent reconciliation and quarantine of anything that does not
  match.
- Learned, honestly, what is defense-in-depth versus a hardware guarantee: the
  layer-3/4 heartbeat is cooperative and does not catch a thread parked in a
  blocking call, the hash chain is tamper-evident rather than tamper-proof
  against root access, and the Merkle root is not signed yet.

## Next steps

- @cogitave.learn.build-a-diyar-solution - the next module in **Introduction
  to Cogitave Diyar**, on the signed device profile, the certified
  verdict-engine registry, and how ISPM-15 became Diyar's first certified
  solution.
- Keep "the edge is the only thing that can ever actuate" in mind - the next
  module builds a device's whole authority model on top of exactly that
  boundary.
