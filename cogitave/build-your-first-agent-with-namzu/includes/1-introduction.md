**Namzu is an agent kernel for TypeScript.** It runs agents the way an operating
system runs processes — isolation, scheduling, budgets, signals, durability, and
an auditable event stream — and it deliberately ships no user interface, no
hosted service, and no favoured model vendor.

In this module you will install the kernel, register a model provider, send your
first call, and declare a tool with a typed input schema. Everything you write
runs locally on Node; you need no account and no cloud key.

By the end you will have working code and, more usefully, a correct mental model
of where the boundary sits: what the kernel owns, and what stays yours.

> [!NOTE]
> Installed on its own, `@namzu/sdk` runs against a pre-registered
> `MockLLMProvider` with no network dependency. You can complete the whole
> exercise before choosing a vendor — which is also why tests against Namzu are
> deterministic and free.
