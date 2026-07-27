You can now configure a Cogitave service and manage its secrets safely.

In this module, you:

- **Classified** every value as a domain invariant (a named code constant), a
  deployment parameter (typed config), or a secret (a `SecretRef`), using the
  12-Factor litmus test to draw the line.
- Assembled config through the **precedence chain** - defaults, `config.toml`,
  `config.{env}.toml`, `COG_*` env vars, then CLI arguments - where later wins,
  and selected the environment by **which overlay file loads**, never by branching
  on the environment name in code.
- Parsed config **once at the boundary** into one typed, immutable value that
  **fails closed** on invalid or missing input, with a precise, layer-attributed
  error.
- Kept secrets out of git with the **three planes**, held a **`SecretRef`** in
  config that resolves at runtime, and used **dotenvx** to commit only
  encrypted-at-rest `.env` files with the private key held in the store.

The single idea underneath all of it: nothing environment-specific is hardcoded,
every secret is a reference, and a misconfigured service refuses to run rather
than fail deep in production.

## Next steps

- [Configuration standard](../../../../standards/docs/standards/configuration.md) -
  the full conformance checklist, feature flags via OpenFeature, and config-as-code
  drift control.
- [Secrets & environment standard](../../../../standards/docs/standards/secrets-and-env.md)
  and [ADR-0008](../../../../standards/docs/decisions/0008-secrets-management-and-dotenvx.md) -
  the secret store, rotation policy, and dev-env handling in full.
