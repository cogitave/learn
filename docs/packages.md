---
uid: cogitave.learn.docs.packages
title: Packages reference
description: Every published Namzu package and what it is responsible for - the kernel, the sandbox and telemetry layers, the operator CLI, the file registry contracts, and the eight model provider drivers.
type: reference
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
roles:
  - developer
  - platform-engineer
level: beginner
order: 1
status: draft
---

# Packages reference

Namzu publishes one kernel and a set of packages around it. You install the
kernel plus only the parts you use; nothing here is bundled by default.

All packages are licensed `FSL-1.1-MIT` - every published version converts to MIT
two years after its release.

## Kernel

| Package | Responsibility |
|---|---|
| `@namzu/sdk` | The kernel: runtime, agents, tools, registry, stores, RAG, connectors. This is the one package you always install. |

## Platform layers

| Package | Responsibility |
|---|---|
| `@namzu/sandbox` | Pluggable sandbox providers - process-level isolation (bubblewrap on Linux, Seatbelt on macOS) and container-level isolation with a JWT-authenticated egress proxy. |
| `@namzu/telemetry` | OTLP exporter pipeline: traces and metrics, resource attributes, platform metrics. |
| `@namzu/computer-use` | Subprocess-based `ComputerUseHost` - screenshot, mouse, keyboard. |
| `@namzu/files` | Provider-agnostic file registry contracts. Contracts, not drivers. |
| `@namzu/cli` | Operator CLI. Ships `namzu doctor`; usable as a bin or as a library. |

## Provider drivers

One package per vendor. Install exactly one - or several, if you switch at run
time. See [Choose a provider](choose-a-provider.md) for guidance.

| Package | Vendor or interface |
|---|---|
| `@namzu/anthropic` | Anthropic Messages API |
| `@namzu/openai` | OpenAI Chat Completions |
| `@namzu/bedrock` | AWS Bedrock Converse |
| `@namzu/openrouter` | OpenRouter, aggregated models |
| `@namzu/ollama` | Ollama, local |
| `@namzu/lmstudio` | LM Studio, local, over WebSocket |
| `@namzu/http` | Any OpenAI- or Anthropic-compatible endpoint. Zero dependencies. |

The kernel also carries a pre-registered `MockLLMProvider`, so `@namzu/sdk`
installed alone runs with no network dependency.

## Requirements

| | |
|---|---|
| Node.js | 20 or later |
| TypeScript | 5.5 or later |
| Module format | ESM. Every package publishes `types` and an `import` entry point. |

## Install shapes

Local development, no key:

```bash
pnpm add @namzu/sdk @namzu/ollama
```

Hosted model with tracing and isolation:

```bash
pnpm add @namzu/sdk @namzu/anthropic @namzu/telemetry @namzu/sandbox
```

Tests only - no provider needed:

```bash
pnpm add @namzu/sdk
```

## Next steps

- [Quickstart](quickstart.md)
- [Choose a provider](choose-a-provider.md)
- [What Namzu is](what-is-namzu.md) - why the surface is split this way.
