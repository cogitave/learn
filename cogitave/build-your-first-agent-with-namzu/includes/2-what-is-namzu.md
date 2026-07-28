**Namzu is an agent *kernel*, not an application framework.** That distinction is
the whole design, so it is worth being precise about it before you write code.

## Framework or kernel

Most agent libraries are application frameworks. They bundle a chat interface, a
hosted dashboard, a fast path for one vendor, and drivers for a handful of
databases. You get a demo in an hour; three months later the library owns your
frontend, your storage, your observability, and your model choice — and none of
those were decisions you made.

Namzu takes the Unix position instead. At the bottom sits a kernel that isolates
work, schedules tool calls, propagates signals across a call tree, manages memory
pressure, persists checkpoints, and emits an auditable event stream. Above it is
user space: shells, editors, IDEs, voice gateways, React apps. The kernel does not
care which one you pick, and the one you pick cannot break the isolation the
kernel provides.

## What is in the kernel, and what is not

| In the kernel | Not in the kernel |
| --- | --- |
| Lifecycle, scheduling, signals | User interface |
| Budgets and memory pressure | Hosted service or control plane |
| Durability and checkpoints | A favoured model vendor |
| Inter-process communication, MCP and A2A | Your database |
| Provider abstraction | Your frontend |
| Auditable event stream | |

The right-hand column is a feature. Nothing phones home, and there is no console
you must sign into for the kernel to work.

## Providers are drivers

A model vendor is not part of the kernel; it is a driver in its own package.

| Package | For |
| --- | --- |
| `@namzu/ollama` | Local inference, zero config, no key |
| `@namzu/lmstudio` | Local inference over LM Studio |
| `@namzu/openai` | OpenAI Chat Completions |
| `@namzu/anthropic` | Anthropic Messages API |
| `@namzu/bedrock` | AWS Bedrock Converse |
| `@namzu/openrouter` | Many models behind one key |
| `@namzu/http` | Any OpenAI- or Anthropic-compatible endpoint |

Every driver returns the same response shape, so the code below your registration
line does not know which vendor answered:

```typescript
{ id, model, message: { role, content, toolCalls? }, finishReason, usage }
```

That uniformity is what makes changing vendor a one-line edit rather than a
migration.

## Authority is declared

A tool declares what it is and what it may reach — its typed input schema, its
permissions, whether it is read-only, whether it is destructive, whether it is
safe to run concurrently. The kernel validates input against the schema *before*
your `execute` function runs, so it only ever sees well-formed arguments.

> [!IMPORTANT]
> Permissions are an allow-list. A tool can reach exactly what it declares and
> nothing more, and an empty permission set is a tool that may compute and reach
> nothing. Adding a behavior means declaring the authority it needs — never
> widening a declaration to make a failing check pass.

## How it is licensed

Namzu is Fair Source: `FSL-1.1-MIT`. Every published version converts to MIT two
years after its release, so you can read it, run it, and build on it today, and
the code becomes fully permissive on a published schedule.
