You installed the Namzu kernel, made a real model call, and declared a tool with
a typed schema and an explicit authority.

In this module, you:

- Separated a **kernel** from an application framework, and saw what Namzu
  deliberately refuses to own — your interface, your storage, your vendor.
- Registered a **provider driver** and learned that changing vendor is a change
  to the registration and to nothing below it.
- Read the **uniform response shape** every driver returns.
- Declared a tool with `defineTool`, stating its `permissions`, `readOnly`,
  `destructive`, and `concurrencySafe` properties rather than leaving them to be
  inferred.
- Saw that `toolCalls` is a **request**, not an execution, and that input is
  validated before your `execute` runs.

## Next steps

- @cogitave.learn.understand-yuva — why Cogitave is building a sovereign kernel
  underneath all of this, and what its verified boot actually proves.
- [Choose a provider](/docs/choose-a-provider/) — the eight drivers and when each
  one fits.
- [Packages reference](/docs/packages/) — the sandbox, telemetry, and built-in
  tool surfaces this module only pointed at.
- [Agent identity and capabilities](/docs/agent-identity-and-capabilities/) — the
  authorisation model the declarations you wrote feed into.
