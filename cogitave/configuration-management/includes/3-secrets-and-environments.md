Config can be committed and reviewed in the open. Secrets cannot. The
[secrets & environment standard](../../../../standards/docs/standards/secrets-and-env.md)
and [ADR-0008](../../../../standards/docs/decisions/0008-secrets-management-and-dotenvx.md)
draw a hard line, and the rule at the top of it is simple.

> [!IMPORTANT]
> **No plaintext secret in git, ever** - not in code, history, CI logs, issues, or
> Terraform state. The *only* secret-shaped thing that may be committed is config
> that is **encrypted at rest**.

## Three planes, never conflated

The standard separates secret handling into three planes. Conflating them is the
mistake that leaks credentials.

| Plane | What | Where |
| --- | --- | --- |
| **Runtime secrets** | DB creds, API and OAuth tokens, signing keys | A secret store (Vault-class or cloud SM), rotated and leased |
| **Config and dev env** | app `.env`, non-prod config, k8s manifests | **Encrypted-at-rest, committed** (dotenvx / SOPS), decrypted at runtime |
| **CI / platform** | cloud access for pipelines | **GitHub OIDC to cloud**, keyless, per-run |

The dev-env plane is a safe *transport* for low- and medium-sensitivity config.
It is **not** a substitute for the store: high-sensitivity and production
credentials always come from the store via workload identity, because dev-env
files are not dynamic, not auto-rotated, and not leased.

## Secrets are referenced, never embedded

This is where configuration and secrets meet. Config carries a **reference**, and
the app resolves the **value** at runtime.

- A secret field's type is **`SecretRef`** - a URI such as `vault://...` or
  `cog-secrets://...` - never a `String` holding a value. A literal-looking secret
  in config is a **parse error**.
- The loader resolves `SecretRef` to a value at startup; if it cannot resolve, the
  service **fails closed**, exactly as it does for any invalid config.
- The config-to-secret edges form an auditable dependency graph: which service may
  resolve which secret.

## The dev-env approach: dotenvx

Plaintext `.env` is the single largest source of leaks, so the standard mandates
**[dotenvx](https://dotenvx.com/)**: encrypted `.env` files that are safe to
commit.

- A **`DOTENV_PUBLIC_KEY`** sits at the top of the encrypted `.env`, so anyone on
  the team can **add and encrypt** values.
- The matching **`DOTENV_PRIVATE_KEY`** is the only thing that can decrypt. It
  lives in `.env.keys`, which is **gitignored**. At runtime `dotenvx run` decrypts
  and injects.
- **Key custody is the important part:** the private keys are themselves *runtime
  secrets*. In production they live in the secret store, never in `.env.keys`; in
  CI/CD the key is fetched via **GitHub OIDC to the store**, not pasted as a static
  repo secret. The encrypted `.env` is committed; the key is not.

For structured files and Kubernetes/GitOps, the reference tool is **SOPS + age**,
which encrypts only the *values* so manifests still diff cleanly.

> [!CAUTION]
> On a leak, the order is fixed: **revoke or rotate the credential first**, then
> purge history with `git filter-repo`, and handle it as a security incident.
> Purging history without rotating leaves a live, exposed credential - and around
> 80% of leaked secrets are still valid when found.
