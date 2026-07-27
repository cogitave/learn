---
uid: cogitave.learn.docs.quickstart
title: Quickstart - run your first agent
description: Install the Namzu kernel and one provider, send a first message, and see the shape of a response. Local-first with Ollama, no account and no hosted service required.
type: tutorial
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

# Quickstart - run your first agent

This is the shortest path from nothing to a working agent call. It runs locally,
needs no account, and takes about five minutes.

If you would rather understand the model before you use it, read
[What Namzu is](what-is-namzu.md) first. If you want a guided course with
exercises, take the [training](/training/) instead - this page is a quickstart,
not a lesson.

## Before you start

- **Node.js 20 or later** and a package manager. The examples use `pnpm`.
- **TypeScript 5.5 or later** if you are writing TypeScript.
- For the local path: [Ollama](https://ollama.com) running on
  `http://localhost:11434` with one model pulled.

You do not need a cloud key for this quickstart. Ollama is the zero-config,
local-first default.

## 1. Install the kernel and a provider

The kernel and the provider drivers are separate packages, so you install
exactly one vendor:

```bash
pnpm add @namzu/sdk @namzu/ollama
```

> [!NOTE]
> Installed on its own, `@namzu/sdk` runs against a pre-registered
> `MockLLMProvider` with no network dependency. That is the right default for
> tests - you can write and run the whole flow before choosing a vendor.

## 2. Register the provider and send a message

```typescript
import { ProviderRegistry, createUserMessage, collect } from '@namzu/sdk'
import { registerOllama } from '@namzu/ollama'

// Register once, at startup.
registerOllama()

const { provider } = ProviderRegistry.create({
  type: 'ollama',
  host: 'http://localhost:11434',
})

// The provider's single entry point is a stream. `collect` drains it into one
// aggregated response when you want the whole answer rather than per-token deltas.
const response = await collect(
  provider.chatStream({
    model: 'llama3.2',
    messages: [createUserMessage('What is the capital of France?')],
  }),
)

console.log(response.message.content)
```

## 3. Read the response

Every provider returns the same shape, whichever vendor produced it:

```typescript
{
  id: string,
  model: string,
  message: { role, content, toolCalls? },
  finishReason: string,
  usage: { /* token counts */ }
}
```

That uniformity is the point of the kernel: the code below the registration line
does not know or care which vendor answered.

## 4. Swap the vendor without touching your code

Changing provider is a change to the registration, not to your agent:

```typescript
import { registerOpenAI } from '@namzu/openai'      // registerOpenAI()
import { registerAnthropic } from '@namzu/anthropic' // registerAnthropic()
import { registerBedrock } from '@namzu/bedrock'     // registerBedrock()
```

Everything after registration stays identical. See
[Choose a provider](choose-a-provider.md) for the full list and the trade-offs.

## What you have now

A local agent call through a vendor-neutral kernel, with a response shape that
will not change when you move to a hosted model.

## Next steps

- [Choose a provider](choose-a-provider.md) - the eight drivers and when each fits.
- [Check your environment](check-your-environment.md) - what `namzu doctor` verifies.
- [What Namzu is](what-is-namzu.md) - the kernel model, and what is deliberately
  not in it.
- [Packages](packages.md) - the full published surface.
