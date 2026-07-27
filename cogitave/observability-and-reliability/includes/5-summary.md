You can now measure a running system and reason about whether it is reliable
enough to keep shipping - the two halves of one discipline.

In this module, you:

- Learned Cogitave's telemetry model from the
  [observability standard](../../../../standards/docs/standards/observability.md):
  **OpenTelemetry-spec** traces, metrics, and logs under one correlation, bound to
  the **Core model** and queryable from **MCP**, where every change, access, and
  inference is a traceable record.
- Saw what **AI/agent observability** adds - the agent trace, token and cost, eval
  drift, and inference records kept as responsible-AI (42001) evidence.
- Defined an **SLI**, an **SLO**, and an **error budget**, and computed one: 99.9%
  over 30 days is ~43 minutes.
- Stated the **error-budget policy** from the
  [reliability standard](../../../../standards/docs/standards/reliability.md) and
  [ADR-0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md) -
  a spent budget triggers a per-service feature freeze - plus the two non-deviable
  rules: freeze on an exhausted budget, and an **SLA always looser than the SLO**.

## You have completed the path

This was the final module of **Cogitave engineering standards**. Completing it
earns the engineering-standards trophy. You now know the non-negotiable floor
every repository works to - from the AGENTS rules through to how a service is
measured and kept reliable - well enough to make changes that pass the org gates
by default.

## Where to go next

- [reliability standard](../../../../standards/docs/standards/reliability.md) -
  re-read on-call, the toil cap, capacity headroom, and chaos/game-days when you
  are ready to operate a service, not just build one.
- [observability standard](../../../../standards/docs/standards/observability.md) -
  the source of truth for the SLI menu and the telemetry spine; link to it, never
  paraphrase it.
