A commit is evidence. Its message and its signature are both read later - by a
reviewer, by the changelog tooling, and by an auditor - so both have a required
shape.

## The Conventional Commit shape

Every commit message follows **Conventional Commits 1.0.0**:
`<type>[scope][!]: <desc>`. This is mandatory everywhere and enforced by
commitlint. The full rule is the
[commits-versioning standard](../../../../standards/docs/standards/commits-versioning.md);
the parts you need for a first commit are:

- **type** (required) - what kind of change it is. `feat` (a new feature, bumps
  MINOR) and `fix` (a bug fix, bumps PATCH) are the two you will reach for most.
  The rest are `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`,
  `test`, and `revert`.
- **scope** (optional) - the area touched, in parentheses: `fix(parser):`.
- **breaking change** - append `!` after the type/scope, and/or add a
  `BREAKING CHANGE:` footer. Either marks it, and it bumps MAJOR.
- **desc** - a short, imperative summary in English.

```text
fix(parser): reject empty capability grant

The grant validator accepted an empty scope list, which read as
"no capability" but was stored as "all". Fail closed instead.
```

commitlint runs this check in two places: the `commit-msg` hook locally and again
in CI on your PR commits and title. A message that does not parse is rejected, so
get it right at commit time rather than after the push.

## Sign the commit

The commit must be **SSH-signed** so GitHub reports it as **Verified**. SSH signing
is mandatory across the estate - it is the lowest-friction path to a verified
commit, and the org branch ruleset **requires signed commits**, so an unsigned
commit is rejected outright. This is set out in the
[hooks-precommit standard](../../../../standards/docs/standards/hooks-precommit.md).

Configure signing once, then let Git sign every commit:

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

> [!WARNING]
> Never disable signing to make a step easier - not with `--no-gpg-sign`, not by
> flipping `commit.gpgsign` off. It is a non-negotiable rule of the floor
> ([AGENTS.md](../../../../../AGENTS.md), rule 3); the ruleset rejects the push
> anyway, and an unsigned commit has no non-repudiation lineage.

With the message shaped and the commit signed, you have the artifact. The next
unit takes it through the gates and into a pull request.
