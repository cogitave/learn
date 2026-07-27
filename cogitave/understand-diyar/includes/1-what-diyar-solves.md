Cogitave Diyar is the platform layer of the Cogitave cloud: multi-tenant management for distributed field devices that must keep working, and keep proving what they did, without the network. This unit lays out the problem it solves and the edge-autonomous model that solves it.

## The problem: unattended, regulated, and offline

Many regulated field processes run unattended, in places where a network connection is not guaranteed — a container yard, a rural depot, a factory floor with no reliable uplink. The regulation does not relax because the connection dropped: the process still has to run correctly, and the operator still has to be able to prove afterward, to an inspector or a compliance officer, exactly what happened.

Diyar's first example of this kind of process is **ISPM-15**: the phytosanitary treatment standard for wood packaging, which requires the wood's core to be held at 56°C for 30 minutes. A device running an ISPM-15 heat treatment has to reach that target, hold it for the required duration, and produce a record an inspector can trust — even if the site's internet link is down for the entire run.

> [!NOTE]
> ISPM-15 is the running example throughout this module because it is Diyar's first, and most mature, solution. It is one instance of a general pattern, not the whole of what Diyar does — Unit 2 covers the platform/solution split in detail.

## Edge-autonomous: the device is the sole authority

Diyar's answer is to make the field device — "the edge" — fully autonomous over the two things a regulator actually cares about: safety and evidence.

- The device sweeps its measurement channels on a fixed cadence, energizes its output through a fail-safe typestate, and evaluates every step against a certified verdict engine, all without needing to reach the cloud.
- Every reading is journaled into a local, tamper-evident hash chain **before** it is published anywhere else, so a power cut or a lost uplink never costs evidence.
- When the uplink returns, a store-and-forward outbox drains the accumulated evidence off-box, and the cloud independently re-derives the hash chain rather than trusting the batch at face value.

The plain statement of the guarantee, from the product's own documentation: a treatment runs to completion with the network, the cloud, and the operator's phone all absent. An expired subscription or a cloud outage may degrade cloud-side features — a fleet dashboard, a remote console — but never measurement, safety, or the device's local certificate of what it did.

## Operational model, end to end

1. An operator starts a treatment at the device's kiosk, or remotely from a web or mobile client. A remote start is a **signed request** the device validates locally and can veto — heater actuation itself is not something the cloud protocol can express directly.
2. The device sweeps its measurement channels, energizes its output through the fail-safe typestate, and evaluates each step against the verdict engine its device profile names.
3. Every reading lands in the local hash chain before it is published.
4. Once the network returns, the outbox drains, and the cloud re-derives the chain independently, quarantining anything that does not reconcile.

```text
start (signed, device may veto)
  -> sweep channels on a fixed cadence
  -> evaluate step against the certified verdict engine
  -> journal reading into the local hash chain
  -> (network permitting) drain outbox to the cloud
  -> cloud independently re-derives the chain
```

## Who this is for

Diyar is built for the people responsible for a regulated, unattended field process, and for the people who have to trust its output afterward: the integrator wiring a device into a plant, the compliance owner who has to hand an inspector a defensible record, and the engineer evaluating whether the platform's safety and evidence model actually holds up under a network outage. None of this assumes the network is reliable at the site — it assumes the opposite, and is designed to keep working anyway.

> [!IMPORTANT]
> Software is defense-in-depth, not the primary protection. Diyar states this plainly in its own safety documentation: a wedged CPU is beyond the software interlock's reach, and a real deployment still requires a hardware thermal cutoff and independent watchdog / fail-safe wiring underneath it. The software interlock is one layer, not the whole guarantee.

## What this unit did not claim

This unit describes the edge's offline authority over safety and evidence — it does not claim that every surface around the edge is equally mature. Unit 3 covers, honestly, which parts of the surrounding architecture are further along than others.
