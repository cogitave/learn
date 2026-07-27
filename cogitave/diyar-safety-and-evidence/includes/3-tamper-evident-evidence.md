Every temperature reading Diyar records becomes evidence before it becomes a verdict, and the platform is built so that evidence survives a power cut, is tamper-evident, and can be proven complete without shipping an entire session's history. This unit follows a reading from the sensor to a reconciled, cloud-side record.

## Journal before publish

The edge's legal store is a local SQLite database running in WAL mode with `synchronous=FULL`. A reading is written into this journal **before** it is published anywhere else — so a power cut or a dropped uplink never costs evidence; the record already exists on disk by the time anything is transmitted. The same table doubles as the store-and-forward outbox: the row that proves a treatment happened is the same row queued to ship, not a separate copy created later.

## The hash chain: tamper-evident by construction

Each committed reading's hash covers the previous reading's hash plus its own canonical bytes (SHA-256), and the very first reading in a session is bound to that session's id, so the chain is anchored to one run from its first row. Re-deriving the chain and comparing it against what's stored fails at the first altered or missing row. Critically, the same canonicalization runs on the edge and in the cloud, so the cloud does not have to take the edge's word for the chain — it can rebuild it independently from the readings it actually received.

> [!NOTE]
> As shipped, this chain is unkeyed plain SHA-256: it is tamper-evident, not tamper-proof against an attacker who already has root on the edge and is willing to recompute the whole chain. Signing the chain with the device's own key is a named hardening step, not something in place today.

## The Merkle history tree: proving completeness

A sequential hash chain alone has a real limitation: proving that reading number 5 exists means shipping readings 1 through 5, and no per-link chain can detect a retroactive edit made between two points the platform already vouched for. On top of the chain (layered over it, not replacing it) each session also builds a Merkle-style history tree: every reading's hash becomes a leaf, leaves combine pairwise into interior nodes up the tree, and the two levels use different, deliberately separated hashing so a leaf can never be mistaken for an interior node. Nodes are never zero-padded to a round number, precisely because padding is what lets two different-sized sessions collide on the same root.

The payoff is that inclusion and consistency become **O(log n)** operations instead of "ship the whole session": you can prove a specific reading belongs to a session's history, and that one published state is a true extension of an earlier one, without either side re-transmitting every prior row. Each session's tree root is updated in the same transaction as the reading that grows it, so a committed reading and its root move together and can never drift apart.

> [!NOTE]
> This tree's root is not yet signed by the device's key. A history tree only proves what a trusted, *published* root pins — writing the root into the tamper-evident audit trail is today's honest interim publication point, and a signed root is a named, not-yet-built follow-up.

## Reconciliation and quarantine at the cloud

Evidence drains from the edge's outbox opportunistically over HTTPS whenever the uplink is available, and rows are marked synced only after the server acknowledges them — at-least-once delivery plus server-side deduplication, which is effectively exactly-once in practice, proven under simulated fleet-wide connection drops with zero loss and zero duplication. On the way in, the cloud re-derives the chain (and the session's tree root) from the readings it actually received and checks that against what the batch claims. Anything that doesn't reconcile is **quarantined**, not accepted on faith — a mismatch here is exactly what a value altered after the fact, and not merely a missing row, would look like.

## The audit chain: a separate trail for who did what

A second, structurally identical hash chain — the audit chain — covers ALCOA+ actor attribution: logins, denials, and session start/stop events. It is verified the same way the evidence chain is: re-derive it, and any alteration breaks it at the first tampered entry. This is a distinct mechanism from the on-device anomaly monitor covered earlier in this module — that one cuts power to the heater; this one is the record of who did what, kept honest the same way the readings are.

> [!WARNING]
> One known gap: the wire format between edge and cloud currently strips each channel's quality flag, carrying only a bare temperature value. Until quality is carried on the wire, a cloud consumer cannot yet tell a genuinely faulted or disabled channel apart from a real zero-degree reading, and should treat a bare 0.0 as ambiguous rather than trustworthy.
