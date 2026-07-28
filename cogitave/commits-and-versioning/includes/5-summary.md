You can now write a commit message that versions and releases the code correctly,
because you understand what the machine does with it.

In this module, you:

- Wrote a **Conventional Commits 1.0.0** message - `<type>[scope][!]: <desc>` -
  and learned to choose the type from the fixed set, add a scope to say where,
  and mark a break with `!` or a `BREAKING CHANGE:` footer, all checked by
  **commitlint** in the `commit-msg` hook and again in CI.
- Traced how commit types **drive Semantic Versioning 2.0.0**: `feat` to MINOR,
  `fix` to PATCH, a break to MAJOR - and how the pre-1.0 rule keeps MAJOR at 0
  until 1.0.0 is declared.
- Saw **release-please** assemble a human-approved Release-PR, a Keep a Changelog
  entry, and a SemVer tag, with release-plz, goreleaser, or Changesets standing
  in for specific repo types.
- Placed a commit in the **trunk-based, protected-main** flow, where a reviewed,
  signed, docs-complete PR and a dev-to-staging-to-prod promotion gate every
  release.

## Next steps

- @cogitave.learn.testing-and-quality - the next module in **Cogitave
  engineering standards**, on the gate a change must pass once it is committed.
- The **commits-versioning standard** is the canonical reference, in the
  estate's standards repository, including the full decision table of engine
  per repo type.
- The **branching-release standard** covers the protected-main ruleset,
  environment promotion, and release flow in full, in the same repository.
- The root **`AGENTS.md`** states rule 2 (Conventional Commits) and rule 3
  (signed commits) at the source; they are the floor every release rides on.
