The [naming standard](../../../../standards/docs/standards/naming.md) opens with
**cross-cutting principles** that apply in every context, then pins concrete
conventions per language and per domain. Learn the principles; they explain the
conventions.

## The principles that decide most names

- **Consistency over preference.** Pick one convention per context and lint it;
  uniformity beats any single "best" casing.
- **No stutter.** Never repeat the namespace, package, or type in a member name -
  `bufio.Reader`, not `bufio.BufReader`.
- **No redundant prefix.** The hierarchy already disambiguates, so drop the
  `cogitave-` echo inside a `cogitave/` namespace. The exception is a *flat
  global* namespace where a prefix avoids collision - `COG_` env vars,
  `com.cogitave.*` event types, `cogitave:` tag keys.
- **Casing by role, not habit.** `UpperCamelCase`, `snake_case`, and
  `SCREAMING_SNAKE_CASE` are assigned by an identifier's role in each language.
- **Immutable IDs; mutable facts in metadata.** Bake only permanent attributes
  into a name. Environment, owner, and cost go in tags and labels - never the
  name.
- **Machine-enforceable.** Every rule maps to a linter or policy gate.

## Naming the things you will touch first

**Repos.** Plain, lowercase **kebab-case** keywords - `bootstrap`, `core`,
`standards`, `agents`, `infra`. **No redundant `cogitave-` prefix**: the org
already provides the namespace. A product family takes its own prefix as it grows
(`yuva-sdk`, `namzu-runtime`). Tiers such as `self`, `public`, and `internal` are
`estate.yaml` metadata **values**, never folders or repo names - do not name a
repo `internal` or `public`.

**UIDs.** Dotted, immutable, globally unique - `cogitave.<area>.<slug>`. A doc's
URL may change; the UID never does.

**Code identifiers.** Cased by role in each language: Rust uses `snake_case` for
functions and `UpperCamelCase` for types, with **acronyms as one word** (`Uuid`,
`Http`, `Mcp`); Go uses `MixedCaps` and keeps initialisms uniform (`ID`, `URL`,
`ServeHTTP`, never `Url`/`Id`); TypeScript uses `PascalCase` types and
`camelCase` values with **no `I`-prefix on interfaces**.

**Files.** TypeScript files are **kebab-case** (`mcp-client.ts`) with
`PascalCase` symbols inside; Rust files are `snake_case.rs` where file equals
module. Repo-root markers are UPPERCASE (`README.md`, `LICENSE`, `CHANGELOG.md`,
`CODEOWNERS`).

**Branches.** `type/ISSUE-ID-kebab-description`, lowercase, a single `/`, the
**type drawn from the Conventional Commits vocabulary** - for example
`feat/COG-417-mcp-stream-cancel`. The commit and version semantics behind that
type are owned by
[commits-versioning](../../../../standards/docs/standards/commits-versioning.md).

> [!TIP]
> When two guides disagree, the naming standard makes one opinionated, linted
> choice and cites its source. You do not have to arbitrate - follow the
> standard's choice and the gate will confirm it.
