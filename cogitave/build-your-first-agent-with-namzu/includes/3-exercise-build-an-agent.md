In this exercise you'll build a minimal Namzu agent — one tool, one resource, a declared identity — and run it on Yuva. Everything here is a self-contained TypeScript snippet you can paste into a `templates/agent` scaffold.

## 1. Scaffold the agent

A Namzu agent starts as an MCP server. Create the server, declaring the capabilities it will support:

```ts
import { Agent } from "@cogitave/namzu";

export const agent = new Agent({
  name: "greeter",
  version: "0.1.0",
  // Identity: how the agent authenticates and what it is authorized for.
  identity: { subject: "agent:greeter", audience: "yuva" },
  // Capabilities are an allow-list. The agent can do exactly this and no more.
  capabilities: { tools: {}, resources: {} },
});
```

## 2. Define a tool

A tool is an action with typed input and output. Namzu validates the input against the schema *before* your handler runs, so the handler only ever sees well-formed arguments. This example is pulled by reference from the snippet registry (`snippets/greeter/agent.ts`) so it stays compile-checked and never rots:

:::code language="typescript" source="snippets/greeter/agent.ts" id="snippet_tool":::

## 3. Define a resource

A resource is an addressable, read-only surface. Here the agent exposes its own manifest under a custom URI scheme so that other agents — and humans — can discover what it is:

```ts
agent.resource({
  uri: "greeter://manifest",
  name: "Agent manifest",
  mimeType: "application/json",
  async read() {
    return { text: JSON.stringify(agent.describe(), null, 2) };
  },
});
```

> [!TIP]
> Resources can be *subscribed* to. If the underlying data changes, Yuva emits a `notifications/resources/updated` message to every subscriber — no polling required.

## 4. Choose a transport

Namzu agents speak MCP over JSON-RPC 2.0. Local development uses `stdio`; remote deployments use Streamable HTTP (the Nov-2025 transport that replaced SSE). Select the tab for your target.

# [stdio (local)](#tab/stdio)

```ts
import { StdioTransport } from "@cogitave/namzu/transport";

await agent.serve(new StdioTransport());
```

# [Streamable HTTP (remote)](#tab/http)

```ts
import { HttpTransport } from "@cogitave/namzu/transport";

await agent.serve(new HttpTransport({ port: 8787, path: "/mcp" }));
```

---

## 5. Run on Yuva

Hand the built artifact to the operating system. Yuva verifies the declared identity, enforces the capability allow-list, isolates the agent, and starts routing MCP traffic to it:

```bash
yuva run ./dist/greeter.js
```

::: moniker range=">=yuva-2.0"
On Yuva 2.0 and later you can attach the agent to a named capability profile, so the OS applies an org policy bundle on top of the agent's own declarations:

```bash
yuva run --profile least-privilege ./dist/greeter.js
```
:::

## 6. Gate on evals

Before an agent is promoted, its behavior is validated against scenarios for **accuracy, coverage, safety, and latency** — including red-team cases. Adding a capability means adding a scenario:

```bash
namzu eval ./evals
```

If you completed @cogitave.learn.get-started-with-yuva, you've now seen both halves of the platform: the OS that runs agents, and the kernel that builds them.

> [!CAUTION]
> Never widen an agent's capabilities to make a failing eval pass. Capabilities follow the behavior you can prove safe, not the other way around.
