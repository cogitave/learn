The [configuration standard](../../../../standards/docs/standards/configuration.md)
builds up in three moves: classify every value, assemble config from ordered
providers, then parse it once into a value that cannot be invalid.

## 1. The line: constant vs configuration vs secret

The first discipline is **classification**. Every value in the codebase is one of
exactly three things, and the bucket decides how it is expressed.

| Bucket | What it is | How it is expressed |
| --- | --- | --- |
| **Domain invariant** | A fact intrinsic to correctness, identical in every environment (`SECONDS_PER_DAY`, `HTTP_OK = 200`, a protocol-fixed frame size) | A **named** `const` in code - never a bare literal |
| **Deployment parameter** | Anything likely to vary between deploys - URLs, pool sizes, timeouts, hostnames, limits, regions | The **typed config layer** |
| **Secret** | A credential, key, or token | A **`SecretRef`** resolved at runtime - never a value in code or config |

The litmus test is 12-Factor's Factor III: *could the codebase be open-sourced at
any moment without leaking a credential or pinning it to one environment?* If
exposing the value leaks a secret or hard-binds an environment, it is **not** a
code constant.

> [!NOTE]
> A bare literal in business logic that is not `0`, `1`, or a self-evident unit is
> a **review-blocking defect**. Even a config *default* is a named, documented
> constant. This is enforced mechanically - `clippy` restriction lints in Rust,
> `mnd` in Go, ESLint `no-magic-numbers` in TypeScript - not by reviewer goodwill.

## 2. The precedence chain

Config is assembled from **ordered providers**, later overriding earlier. This
cross-ecosystem chain is the Cogitave standard:

```
built-in defaults
  -> config.toml                 (committed base)
  -> config.{env}.toml           (committed per-environment overlay)
  -> COG_* environment variables (deploy-time + secret references)
  -> command-line arguments      (explicit override)     [highest precedence]
```

One prefix, granular keys. 12-Factor's explicit anti-pattern is grouping config
into in-code `dev`/`test`/`prod` bundles, which causes a "combinatorial
explosion." The environment is selected by **which overlay file loads**
(`config.{env}.toml`), never by branching logic in code. Environment variables
are a **narrow override and secret-reference channel**, not the primary store -
they are global, untyped, and leak via logs and child processes.

## 3. Parsed once, typed, fail-closed

This is the doctrinal core.

- **One canonical JSON Schema per service is the source of truth**; the Rust, Go,
  and TypeScript types are *generated* from it, so they never drift by hand.
- **Parse, don't validate.** Read the raw files and env into a single **typed,
  immutable `Config` value once, at the boundary, at startup.** After a successful
  parse you hold a value that **cannot be invalid**, and downstream code never
  re-checks it.
- **Make illegal states unrepresentable** with enums and newtypes (`Port`, `Url`,
  `NonEmptyString`), so impossible config will not parse.
- **Fail-closed.** Invalid or missing-required config means the process **refuses
  to start**, emitting a precise, **layer-attributed** error that names which
  file, env var, or flag was wrong. Cert-grade means never running misconfigured.

Finally, config is **config-as-code**: it lives in git, is reviewed like code, and
each service exposes an effective-config surface with **per-key provenance** -
which layer set each value - with secrets masked. That provenance is ready-made
change-management evidence.
