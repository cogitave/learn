Observability is the layer that **measures** the platform's performance claims;
it is also where SOC 2 CC7 monitoring comes from. The
[observability standard](../../../../standards/docs/standards/observability.md)
is short and directive - this unit walks its four parts.

## 1. Three signals, one correlation

An AI-native org's telemetry is **OpenTelemetry-spec**: the collector and SDK conform to
the OpenTelemetry specification rather than importing a vendor agent. There are
three signals, correlated under one model:

- **Traces** - the path of a request across services, span by span.
- **Metrics** - numeric time series (latency, error counts, throughput).
- **Logs** - structured, queryable event records.

The point of one correlation is that a single latency spike, its error log, and
the trace that produced it are the **same** record read three ways. The standard
states this as structured, queryable evidence: **every change, access, and
inference is a traceable record**. When you instrument a service, you are not
adding debug output - you are producing audit evidence.

## 2. SLIs measured on the real system

A **Service Level Indicator (SLI)** is a measured signal of health. The standard
defines the menu each service draws from:

- **Latency** - p50 and p99 of the operation.
- **Error rate** - the fraction of requests that fail.
- **Availability** - the fraction of time the service is serving.

The measured targets are realistic, not aspirational: **single- to
low-double-digit millisecond p99** at the edge for a knowledge/MCP query, and
ns-class only for in-process operations. The standard's own rule is that
ns-class claims are in-process and **measured, never asserted**. When the error
budget behind an SLO is exhausted, that is the **release-freeze trigger** - the
mechanism the next unit engineers into a policy.

## 3. AI and agent observability

Because an AI-native org runs agents, telemetry covers a surface most observability
stacks ignore. On top of the three signals, the standard requires:

- **The agent trace** - each step and tool call an agent makes, so an agent run
  is as inspectable as an HTTP request.
- **Token and cost** per inference.
- **Eval drift** and **hallucination / guardrail-violation** monitoring.

Crucially, **inference records are kept as responsible-AI evidence** for
ISO/IEC 42001. An agent's behavior is not ephemeral; it is retained the way a
financial transaction is. This is the same "assume non-repudiation" posture the
[AGENTS floor](../../../../../AGENTS.md) sets for every action.

## 4. Propagation: bound to the Core model

The last part is what makes the whole thing queryable. **All signals are bound to
the canonical model** - Cogitave's Core, in the reference implementation - so
telemetry is reachable from **MCP** - a human and an agent ask the same question
of the same model and get the same answer. The
standard calls this **dogfooding observability**: the platform observes itself
through the same interface it exposes to everyone else.

> [!TIP]
> When you instrument a new service, the checklist is short: emit all three
> signals under one correlation, define at least the latency/error/availability
> SLIs, add the agent trace and token/cost if it calls a model, and confirm the
> signals land on the Core model so they answer from MCP. The standard is the
> source of truth for each of these - link to it, do not reinvent it.
