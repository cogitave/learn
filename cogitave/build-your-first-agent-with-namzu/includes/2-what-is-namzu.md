**Namzu** is the agent *kernel*. It is the lowest layer an agent author touches: a TypeScript library plus a runtime contract that turns a handful of typed declarations into a working, MCP-native agent. **Yuva** is the agent *operating system* that hosts what Namzu produces.

## Kernel and operating system

A useful analogy: the kernel defines the primitives (processes, capabilities, system calls); the operating system schedules them, isolates them, and exposes them to the outside world.

| Layer | Product | Language | Phase | Responsibility |
| --- | --- | --- | --- | --- |
| Operating system | Yuva | Rust | Serve / runtime | Identity verification, capability enforcement, isolation, the runtime surface agents execute against |
| Kernel / SDK | Namzu | TypeScript | Build / authoring | Tool and resource definitions, capability declarations, MCP wiring, evals |

Build (Namzu / TypeScript) is deliberately **decoupled** from serve (Yuva / Rust): you author and test on one side, and the OS runs the artifact on the other.

## Everything is MCP

Namzu is **MCP-native**. An agent's entire public surface is described as MCP **tools** (actions) and **resources** (read-only context, addressed by URI). There is no second, bespoke protocol: the same surface a human calls through an API is the surface an agent calls through MCP.

- **Tools** are actions with typed input and output schemas — `CallTool` over JSON-RPC 2.0.
- **Resources** are addressable read surfaces (for example `cogitave-docs://{product}/{version}/{uid}`) that can be listed, read, and *subscribed* to for change notifications.

## Capabilities, identity, and boundaries

Every Namzu agent declares, up front and in the least-privilege spirit:

- **Identity** — how the agent authenticates and what it is authorized for.
- **Capabilities** — the exact tools and resources it may expose or call.
- **Boundaries** — what it must *not* do, and the data it may *not* touch.
- **Escalation** — the human-in-the-loop points where it defers to a person.

Yuva enforces these at run time; Namzu makes you state them at build time. That pairing — declared in the kernel, enforced by the OS — is the heart of the agent security model.

> [!IMPORTANT]
> Capabilities are *allow-lists*, not deny-lists. An agent can do exactly what it declares and nothing more. Adding a new behavior means adding a new declared capability *and* a new eval scenario for it.
