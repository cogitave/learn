Misconfiguration is not a minor operational nuisance. Across two decades of
empirical research, configuration errors are the largest category of operator
error, and operator error is the largest single source of failure - yet the
system's own handling of bad input is often the real defect, because it accepts
a wrong value silently instead of refusing to run. The response an AI-native org
needs is a **cert-grade** rule: a service must **refuse to start** when it is
misconfigured, rather than fail deep in production.

That rule deserves a governing document - Cogitave writes two. Its
[configuration standard](../../../../standards/docs/standards/configuration.md)
owns *how config works* - classification, precedence, typed schema-validated
parsing, and config-as-code. Its
[secrets & environment standard](../../../../standards/docs/standards/secrets-and-env.md)
owns *secret material* - the store, rotation, and how developers manage local
`.env` files. This module teaches you to **use both**; when you need the full
detail, follow the link to the standard rather than trusting a paraphrase.

> [!IMPORTANT]
> **Nothing that varies between deployments is hardcoded.** Every such value is a
> typed, externalized parameter, and every secret is a *reference* resolved at
> runtime. This is the configuration standard's opening line, and it is the one
> idea the rest of the module builds on.

## What you will be able to do

- **Classify** any value as a domain invariant, a deployment parameter, or a
  secret - and know the litmus test that draws the line.
- **Load** configuration through the standard precedence chain, parsed once into
  one typed, immutable value that fails closed.
- **Select an environment** the right way - by which overlay file loads, not by
  branching on the environment name in code.
- **Manage secrets safely** - hold a reference in config, resolve it at runtime,
  and commit only encrypted-at-rest `.env` files with the key held in the store.

Two units of substance, a knowledge check, and a summary. By the end you can
configure a real service and manage its secrets without ever putting a credential
in git.
