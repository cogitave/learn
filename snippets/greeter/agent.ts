// Snippet registry source for learn.cogitave.com.
// Referenced by :::code source="snippets/greeter/agent.ts" id="<region>":::.
// Named regions are delimited by line-comment markers: // <region> … // </region>.
// The snippets loader excludes this file from the published content set and
// resolves every referenced region by name; type-checking is not yet wired into
// the build (see docs/build-v0.md), so every symbol here is hand-verified
// against the real `@namzu/sdk` surface. Do not add an example the SDK does not
// actually export - a tutorial that teaches a signature the package does not
// have is worse than no tutorial at all.

// <snippet_register>
import { ProviderRegistry, createUserMessage, collect } from "@namzu/sdk";
import { registerOllama } from "@namzu/ollama";

// Register once at startup. Swapping vendor is a change to these two lines and
// to nothing below them.
registerOllama();

const { provider } = ProviderRegistry.create({
  type: "ollama",
  host: "http://localhost:11434",
});
// </snippet_register>

// <snippet_chat>
// The provider's single entry point is a stream (`chatStream`). When you want
// the whole answer rather than per-token deltas, `collect` drains the stream
// into one aggregated response.
const response = await collect(
  provider.chatStream({
    model: "llama3.2",
    messages: [createUserMessage("Greet a developer named Arda in one sentence.")],
  }),
);

// Uniform across every provider:
// { id, model, message: { role, content, toolCalls? }, finishReason, usage }
console.log(response.message.content);
// </snippet_chat>

// <snippet_tool>
import { z } from "zod";
import { defineTool } from "@namzu/sdk";

export const GreetTool = defineTool({
  name: "greet",
  description: "Return a friendly greeting for a given name.",
  inputSchema: z.object({ name: z.string().min(1) }),
  // One of: 'filesystem' | 'shell' | 'network' | 'analysis' | 'custom'.
  category: "custom",
  // Authority is declared, not assumed: an empty permission set is a tool that
  // may compute and reach nothing.
  permissions: [],
  readOnly: true,
  destructive: false,
  concurrencySafe: true,
  // execute returns a ToolResult: `success` plus the `output` string the model
  // sees. It never throws to the caller - defineTool wraps failures into
  // { success: false, output: "", error }.
  async execute({ name }) {
    return { success: true, output: `Hello, ${name}, from your first Namzu tool.` };
  },
});
// </snippet_tool>

// <snippet_toolcalls>
import { ToolRegistry } from "@namzu/sdk";

// A registry owns the tools. It converts them to the provider-neutral wire
// format and it is what executes them, so validation is not your job.
const registry = new ToolRegistry();
registry.register(GreetTool);

const withTools = await collect(
  provider.chatStream({
    model: "llama3.2",
    messages: [createUserMessage("Greet a developer named Arda.")],
    tools: registry.toLLMTools(),
  }),
);

// Every field here is required by ToolContext. A real runtime supplies it; this
// is the minimum a standalone script needs.
const context = {
  runId: "run_local" as const,
  workingDirectory: process.cwd(),
  abortSignal: new AbortController().signal,
  env: {} as Record<string, string>,
  log: (level: "info" | "warn" | "error", message: string) => console.error(level, message),
};

for (const call of withTools.message.toolCalls ?? []) {
  // `toolCalls` is the model's REQUEST. Nothing has run yet - the registry
  // validates the arguments against the schema and only then invokes execute.
  // A call names its tool under `function.name`, and `function.arguments` is a
  // JSON string, so parse it before handing it to the registry.
  const result = await registry.execute(
    call.function.name,
    JSON.parse(call.function.arguments),
    context,
  );
  console.log(call.function.name, result);
}
// </snippet_toolcalls>
