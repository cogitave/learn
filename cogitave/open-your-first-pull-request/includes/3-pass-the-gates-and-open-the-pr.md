You have a signed, well-formed commit. Now let the checks run, make the change
docs-complete, and open the pull request.

## Let the pre-commit hooks run

When you commit, **lefthook** runs the standard set of checks against your staged
files. Lefthook is the single polyglot runner for the estate; the same commands
run in CI. The
[hooks-precommit standard](../../../../standards/docs/standards/hooks-precommit.md)
defines the full set:

| Stage | What runs |
| --- | --- |
| Formatters | rustfmt, gofumpt, biome (TS/JSON/CSS/MD) |
| Linters | clippy (`-D warnings`), golangci-lint, biome lint |
| Hygiene | trailing-whitespace, final newline, large-file block, merge-conflict and YAML/JSON validity |
| Secret scan | gitleaks on staged files, offline |
| commit-msg | commitlint (Conventional Commits) |

Formatters that fix files re-stage them, so most style problems are corrected
before you even see them.

> [!IMPORTANT]
> The hook is a **bypassable convenience** - the real gate is CI. A contributor
> can skip the local hook, but the same checks run again on the pull request and
> block the merge there. So a green hook is a head start, not a guarantee; a
> passing PR is what counts. In CI the secret scan is also deeper (full history),
> not just staged files.

## Satisfy docs-as-code

Cogitave's rule is blunt: **if code changes, docs change.** The `docs-required`
CI gate fails a pull request that touches code but does not touch `docs/`, a
`*.md` file, or the `CHANGELOG`. This is the floor
([AGENTS.md](../../../../../AGENTS.md), rule 4) and the
[documentation standard](../../../../standards/docs/standards/documentation.md);
there is a `docs-exempt` label for the genuine exceptions, but reaching for it is
the exception, not the habit. Separately, schema validation and any broken
xref, link, or bookmark are **blocking errors**, so the docs you write have to
resolve, not just exist.

Practically: before you open the PR, ask what a reader needs to know because of
your change, and write that down in the same branch.

## Open the pull request

Push your branch and open the PR. You are **proposing** a change - opening a
GitHub PR and stopping for review is exactly the propose-only shape you learned in
the request lifecycle. The reviewer and the CODEOWNER hold the merge gate; agents
propose and humans enact
([AGENTS.md](../../../../../AGENTS.md), rules 6-7).

> [!TIP]
> Never push to a protected branch. Open a branch and a PR, let every gate go
> green, and let a human merge. That is the finish line.
