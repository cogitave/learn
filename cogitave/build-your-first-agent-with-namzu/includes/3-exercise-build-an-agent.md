In this exercise you install the kernel, make a real model call, and declare a
tool with a typed input schema. It runs locally and needs no account.

Every snippet below uses a symbol `@namzu/sdk` actually exports. The tool
examples are pulled by reference from the snippet registry
(`snippets/greeter/agent.ts`) so they stay compile-checked and cannot rot.

## Before you start

- **Node.js 20 or later**, and a package manager. The commands use `pnpm`.
- **TypeScript 5.5 or later**.
- Optional, for the local model path: [Ollama](https://ollama.com) running on
  `http://localhost:11434` with one model pulled.

## 1. Install the kernel and one driver

The kernel and the vendor drivers are separate packages, so you install exactly
one vendor:

```bash
pnpm add @namzu/sdk @namzu/ollama zod
```

> [!TIP]
> If Ollama is not running, install only `@namzu/sdk` and skip ahead. The kernel
> carries a pre-registered `MockLLMProvider`, so every step below still executes —
> it simply answers from the mock instead of a model.

## 2. Register a provider

Registration happens once, at startup. It is the only vendor-specific code in
your program:

:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_register":::

## 3. Send your first call

:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_chat":::

Run it. The response shape is the same for every driver:

```typescript
{ id, model, message: { role, content, toolCalls? }, finishReason, usage }
```

That is the contract the kernel guarantees. A driver that cannot satisfy it is a
bug in the driver, not something your code has to work around.

## 4. Declare a tool

A tool is an action with a typed input schema and a declared authority. Note what
`defineTool` makes you state explicitly — this is the least-privilege model in
practice, not a slogan:

:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_tool":::

Four of those fields are declarations *about* the tool rather than behaviour of
it:

| Field | What you are asserting |
| --- | --- |
| `permissions` | Exactly what the tool may reach. `[]` means it computes and reaches nothing. |
| `readOnly` | Whether running it can change anything. |
| `destructive` | Whether it can destroy something. May be a function of the input. |
| `concurrencySafe` | Whether two invocations may overlap. |

The kernel uses these to decide what it is allowed to do on your behalf — for
example whether it may run a call in parallel, or whether it must stop and defer
to a person.

## 5. Register it, offer it, and execute the result

A `ToolRegistry` owns your tools. It converts them into the provider-neutral wire
format with `toLLMTools()`, and it is what executes them - so validating the
model's arguments is not your job:

:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_toolcalls":::

Three things worth noticing:

- `toolCalls` is the model's **request**, not an execution. Nothing runs until you
  ask the registry to run it.
- The registry validates arguments against your schema *before* invoking
  `execute`, so it never has to defend against malformed input.
- The `ToolContext` is where authority actually arrives at run time - the working
  directory, the environment, the abort signal. A real runtime supplies it; the
  snippet builds the minimum a standalone script needs.

> [!CAUTION]
> Do not widen a tool's `permissions` to make a call succeed. If a tool needs
> more authority, that is a decision to make deliberately — and to record —
> not a value to bump until an error stops appearing.

## Where to go deeper

The kernel also covers sandboxing (`@namzu/sandbox`), telemetry over OTLP
(`@namzu/telemetry`), file registry contracts, and a set of built-in tools such
as `ReadFileTool`, `GrepTool`, and `BashTool`. The
[packages reference](/docs/packages/) lists the published surface.
