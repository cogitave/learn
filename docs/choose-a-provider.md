---
uid: cogitave.learn.docs.choose-a-provider
title: Choose a provider
description: The model providers Namzu ships as drivers, how to register one, what changes when you switch, and which to pick for local development, hosted inference, aggregation, or an OpenAI-compatible endpoint of your own.
type: how-to
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
roles:
  - developer
level: beginner
order: 1
status: draft
---

# Choose a provider

Namzu keeps model vendors out of the kernel. Each vendor is a **driver** in its
own package; you install the one you use and register it once. Everything after
the registration line is vendor-neutral, so switching is a change to one import
and one call.

## The drivers

| Package | Use it for |
|---|---|
| `@namzu/ollama` | Local inference. Zero-config default, no key, no network egress. |
| `@namzu/lmstudio` | Local inference over LM Studio's WebSocket interface. |
| `@namzu/openai` | OpenAI Chat Completions. |
| `@namzu/anthropic` | Anthropic Messages API. |
| `@namzu/bedrock` | AWS Bedrock Converse - useful when the account boundary matters. |
| `@namzu/openrouter` | Aggregated access to many models behind one key. |
| `@namzu/http` | Any OpenAI- or Anthropic-compatible endpoint. Zero dependencies. |
| *(none)* | `MockLLMProvider`, pre-registered with the kernel. No network. |

## Register one

Registration is two lines, and the shape is the same for every driver:

```typescript
import { ProviderRegistry } from '@namzu/sdk'
import { registerOllama } from '@namzu/ollama'

registerOllama()

const { provider } = ProviderRegistry.create({
  type: 'ollama',
  host: 'http://localhost:11434',
})
```

To move to a hosted vendor, change the import and the `type`:

```typescript
import { registerAnthropic } from '@namzu/anthropic'

registerAnthropic()

const { provider } = ProviderRegistry.create({ type: 'anthropic' })
```

Your agent code does not change.

## Which one to start with

- **Developing, or writing tests?** Install nothing extra. The kernel's
  `MockLLMProvider` is already registered and needs no network, which makes test
  runs deterministic and free.
- **Working offline, or keeping data on your machine?** `@namzu/ollama`. It is the
  local-first default for a reason: no key, no egress.
- **Running in production against a frontier model?** `@namzu/openai`,
  `@namzu/anthropic`, or `@namzu/bedrock`. Pick on the account and compliance
  boundary you need, not on the API - the kernel hides the API difference.
- **Comparing many models cheaply?** `@namzu/openrouter`.
- **Serving your own weights, or a gateway in front of them?** `@namzu/http`,
  pointed at your endpoint.

> [!TIP]
> Register the mock in tests and the real driver in production from the same
> code path. Because the response shape is identical, a test that passes against
> the mock is exercising the same contract the vendor will satisfy.

## What stays the same across drivers

Every provider returns:

```typescript
{ id, model, message: { role, content, toolCalls? }, finishReason, usage }
```

That is the contract. A driver that cannot satisfy it is a bug in the driver, not
something your agent has to work around.

## Next steps

- [Quickstart](quickstart.md) - the shortest end-to-end path.
- [Check your environment](check-your-environment.md) - confirm a driver is
  reachable before you debug your agent.
- [Packages](packages.md) - versions and the rest of the surface.
