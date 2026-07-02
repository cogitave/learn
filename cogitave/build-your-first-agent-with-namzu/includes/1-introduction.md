In the previous module you learned what **Yuva** is — the operating system that agents run on. Now you'll cross to the other side of the stack and *build* an agent with **Namzu**, the agent kernel.

Where Yuva is the runtime (Rust, serve-time), Namzu is the kernel and software development kit you author against (TypeScript, build-time). A Namzu agent is a small, typed program that exposes **tools** (actions it can take) and **resources** (read surfaces it can expose) over the Model Context Protocol (MCP), declares its **identity** and **capabilities**, and is gated by an **evaluation harness** before it ever reaches the OS.

In this module you'll scaffold an MCP server with Namzu, give it one tool and one resource, declare its capability boundaries, choose a transport, and run it on Yuva.

## Learning objectives

By the end of this module, you'll be able to:

- Explain how the Namzu agent kernel relates to the Yuva agent operating system.
- Build a minimal Namzu agent that exposes an MCP tool and resource.
- Declare an agent's identity, capabilities, and sandbox boundaries.
- Run your agent on Yuva over `stdio` or Streamable HTTP.

## Prerequisites

- Completion of @cogitave.learn.get-started-with-yuva.
- Basic familiarity with TypeScript.

> [!NOTE]
> This module is authored to the Microsoft Learn `learn-pr` convention (`### YamlMime:Module` + `includes/`) and served by Cogitave's own from-scratch documentation engine. The format is the standard; the engine is ours.
