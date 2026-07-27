Diyar's cloud and mobile clients can ask an edge device to start a treatment, but nothing in the protocol lets them force it. This unit covers the shape of a remote-start request, why the cloud holds no actuation primitive at all, and the one config-only exception carved out for the device shadow.

## Where a treatment can be started

An operator starts a treatment at the kiosk on the LAN, or remotely from a web or mobile client. Both paths reach the same one door: the edge validates every request locally before anything is energized.

## The signed, vetoable remote-start request

A remote start is a **signed, device-bound, nonce- and TTL-limited request** that the edge independently validates and **may veto** — heater actuation is not something the cloud protocol can represent directly. Every route is authenticated and tenant-scoped, but authentication only gets a request to the edge's own door; it is the edge, not the cloud, that decides whether the door opens.

This holds for automated callers too: any tool that wraps the remote-start path is exactly that — a wrapper over the same signed contract the edge already verifies and can refuse. Adding a caller never adds a second way in.

## Authority is one-directional

- No cloud primitive energizes anything: the cloud can request, advise, and mirror state; by design, it holds no primitive that turns heat on.
- There is deliberately no broadcast actuation primitive anywhere in the system — mass remote ignition is named as the top threat the architecture defends against, not a capability it offers.
- Even a fully compromised cloud component still only reaches the edge's verify-and-veto gate; it cannot skip it.

> [!IMPORTANT]
> This is a design invariant, not a today's-implementation detail: the accepted architecture blueprint states that the signed, edge-verified, edge-vetoable session start is the *only* path to energy, "for agents too" — nothing added later is allowed to introduce a second one.

## The device shadow: desired state is config-class only

Diyar keeps a device shadow with a reported half and a desired half (plus a version, for optimistic concurrency). This is deliberately different from how some other IoT platforms use a device twin's desired state:

- **Desired is config-class only** — things like the OTA update channel, the sampling interval, or log verbosity — drawn from an allow-list derived from the device's profile.
- Writing a desired value is **never** actuation. The edge treats desired state purely as advisory configuration that it acknowledges back into reported state.
- Actuation stays exclusively on the signed session-start path with edge veto, full stop.

As of the most recent delivery record, the cloud-to-device half of this is wired for on-prem deployments: a config-class desired value is published to the device over the local broker, and the edge **re-validates every delivered key, fail-closed, against the same config-class allow-list** before applying it — so even a broker an attacker fully controls cannot push anything past config-class.

> [!NOTE]
> A separate, write-only "advisory commands" path was considered and then removed from the contract rather than kept around unused — one fewer door is safer than a door nobody uses. Delivering desired state onto AWS IoT's shadow mechanism is a documented follow-up, not yet built; the edge side needs no change when it lands, because it already subscribes to that channel.

## Why the boundary is drawn here

The recurring theme across the request path and the shadow is the same: every surface that reaches the cloud terminates in something the edge can refuse or ignore, never something the edge is compelled to obey. A signed request can be vetoed. A desired-state write can only ever mean configuration. Authority over energy stays local to the device that has to answer for what it did — which is also why the evidence it produces has to be trustworthy on its own, covered next.
