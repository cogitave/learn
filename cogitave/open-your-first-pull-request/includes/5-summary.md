You took a small change all the way to an open pull request the way every
contributor and agent does it in Cogitave's estate - and you can now do it so it
passes on the first try.

In this module, you:

- Wrote a **Conventional Commit** (`<type>[scope][!]: <desc>`), chose `fix` or
  `feat`, and learned how to mark a breaking change.
- **SSH-signed** the commit so GitHub reports it Verified, and saw why signing is
  never disabled.
- Let the **pre-commit hooks** run - formatters, linters, gitleaks, commitlint -
  and learned that the hook is a convenience while **CI is the real gate**.
- Satisfied **docs-as-code** so the change ships with its documentation, and
  **opened the PR** - proposing the change and stopping for human review.

That completes the four modules of the onboarding path: a non-negotiable floor,
the inherited baseline, the request lifecycle, and now a real contribution that
applies all three.

## Next steps

- @cogitave.learn.paths.contributor-onboarding - return to the path to claim your
  trophy, then pick a role track that builds on this Tier-0 entry point.
- The **commits & versioning standard** is the canonical reference, in the
  standards repository, for the full type list, SemVer, and how release
  automation reads your commits.
- The **Git hooks / pre-commit standard** covers every check lefthook runs,
  and the local-CI parity behind it.
