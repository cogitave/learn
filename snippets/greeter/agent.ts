// Snippet registry source for learn.cogitave.com.
// Referenced by :::code source="snippets/greeter/agent.ts" id="<region>":::.
// Named regions are delimited by line-comment markers: // <region> … // </region>.
// This file is a compile-checked example; the snippets loader excludes it from
// the published content set but resolves and type-checks every referenced region.

// <snippet_scaffold>
import { Agent } from "@cogitave/namzu";

export const agent = new Agent({
  name: "greeter",
  version: "0.1.0",
  // Identity: how the agent authenticates and what it is authorized for.
  identity: { subject: "agent:greeter", audience: "yuva" },
  // Capabilities are an allow-list. The agent can do exactly this and no more.
  capabilities: { tools: {}, resources: {} },
});
// </snippet_scaffold>

// <snippet_tool>
agent.tool({
  name: "greet",
  description: "Return a friendly greeting for a given name.",
  input: { name: { type: "string", minLength: 1 } },
  async handler({ name }) {
    return { content: `Hello, ${name}, from your first Namzu agent.` };
  },
});
// </snippet_tool>

// <snippet_resource>
agent.resource({
  uri: "greeter://manifest",
  name: "Agent manifest",
  mimeType: "application/json",
  async read() {
    return { text: JSON.stringify(agent.describe(), null, 2) };
  },
});
// </snippet_resource>
