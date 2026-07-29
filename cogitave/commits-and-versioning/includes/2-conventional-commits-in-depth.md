Conventional Commits 1.0.0 is a small, strict grammar. Cogitave's
[commits-versioning standard](../../../../standards/docs/standards/commits-versioning.md)
states it in one line - `<type>[scope][!]: <desc>` - and every commit in its
estate follows it. This unit unpacks each part.

## The type carries the meaning

The **type** is the first token, and it is not decoration - it is what a machine
reads. The standard fixes the allowed set:

- **`feat`** - a new feature. Drives a **MINOR** version bump.
- **`fix`** - a bug fix. Drives a **PATCH** bump.
- **`build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`,
  `revert`** - everything else. These do not, on their own, bump the version.

Two types therefore move the version and the rest do not. That is the whole
reason to choose the type deliberately: calling a bug fix a `chore` hides it from
the changelog and skips the patch release; calling a docs tweak a `feat` ships a
version bump nobody needed.

## The scope narrows the where

The optional **scope** in parentheses says *where* the change lands -
`feat(parser):`, `fix(auth):`. It is a grouping aid for humans and changelog
tools; it does not change the version math. Use it when a repo has clear
sub-areas, and keep the same scope names across commits so the history stays
grep-able.

## Two ways to mark a break

A breaking change is the one that bumps the **MAJOR** version, so it has to be
unmistakable. The standard gives two markers, and you may use either or both:

- a **`!`** before the colon - `feat(api)!: drop the v1 field`;
- a **`BREAKING CHANGE:`** footer at the bottom of the message body.

Either one tells the release engine this is a major change. Never smuggle a
breaking change in under `fix` or `feat` without the marker - the version it
produces would understate the impact, and downstream consumers would upgrade
into a break with no warning.

> [!TIP]
> A commit body and footers are still just text under the header line. Put the
> `BREAKING CHANGE:` footer on its own paragraph at the end so both humans and
> the tooling find it.

## commitlint enforces the shape - twice

None of this is honour-system. **commitlint** with
`@commitlint/config-conventional` validates every message against the grammar
above, and it runs in **two** places per the standard: the local `commit-msg`
hook (wired through lefthook) and again in **CI**, which checks the PR's commits
and title. A message such as `updated stuff` has no type prefix, so it is
rejected at the hook before it is ever pushed - and if it somehow reaches the PR,
CI rejects it again. The convention holds because the machine checks it every
time, on the way in and again at the gate.
