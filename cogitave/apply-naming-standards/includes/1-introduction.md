A name is the first thing anyone reads - a human scanning a repo list, an agent
resolving a UID, a linter deciding whether your commit lands. In most codebases
naming is a matter of taste, argued in review and settled inconsistently. In the
Cogitave estate it is a **standard**, and the standard is **machine-enforced**:
every rule maps to a CI gate, so a naming violation fails the build the same as a
failing test.

That standard is the
[naming standard](../../../../standards/docs/standards/naming.md). It owns the
**cross-cutting principles** and the per-language and per-domain conventions -
from a Rust type to an AWS tag to a Kafka topic - so a human or an agent meets
one predictable convention everywhere. Where another standard already owns a
slice (API field casing, env-var names, commit and branch *types*), the naming
standard **references it, not restates it**.

> [!IMPORTANT]
> Naming is machine-enforced, not reviewer goodwill. Every rule in the naming
> standard maps to a linter or policy gate - `rustfmt` and `clippy`, `gofmt` and
> `go vet`, ESLint, `tflint`, tag policies, OPA - and fails CI when broken. Learn
> the rule from the standard; the gate will hold you to it.

## Two ideas, kept apart

This module teaches two things that are easy to confuse:

- **The naming rules** - how you name a *functional* thing: an identifier, a
  file, a repo, a branch. The keyword-first principle governs here: names are
  plain keywords, with no redundant `cogitave-` prefix, because the hierarchy
  already provides the namespace
  ([ADR-0007](../../../../standards/docs/decisions/0007-keyword-naming.md)).
- **Codenames** - the durable internal identity of a *product*, drawn from a
  deliberate thematic lexicon, allocated through a gated process. A codename is
  not a functional name and is not always allowed.

## What you will get from this module

Not a style opinion - a working command of the estate's naming rules, the ability
to name a new artifact correctly on the first try, and a clear line between a
functional keyword and a product codename so you know which one a situation calls
for. Throughout, the move is the same: follow the standard to the owning rule
rather than paraphrasing it from memory.
