In most projects a commit message is a note to a human: a short line someone
might read later while hunting a regression. In an AI-native org it is that **and** an
instruction to the machine. The type you put in front of your message decides
whether the next release is a patch, a minor, or a major version - and whether
your change even appears in the changelog. Write the message carelessly and you
version the code wrong.

An AI-native org puts this in a non-negotiable floor; Cogitave's own, for
instance, makes it rule 2 in the root [`AGENTS.md`](../../../../../AGENTS.md):
every commit is **Conventional Commits 1.0.0**, `<type>[scope][!]: <desc>`. This
module is where that one-line rule becomes a working skill. Cogitave's single
source of truth for it is the
[commits-versioning standard](../../../../standards/docs/standards/commits-versioning.md);
the branching and release flow that carries a commit to a release lives in the
[branching-release standard](../../../../standards/docs/standards/branching-release.md).
Learn the shape here, then follow those docs for the exact detail.

> [!IMPORTANT]
> The commit message is the input to versioning. `feat` bumps the MINOR version,
> `fix` bumps PATCH, and a breaking change bumps MAJOR - automatically. You are
> not describing the change after the fact; you are declaring its release impact.

## Why it is enforced, not suggested

Because the message drives an automated release, it cannot be optional.
**commitlint** checks every message against the Conventional Commits grammar in
two places - the local `commit-msg` hook and again in CI - so a malformed message
is rejected before it can mislead the release engine. A convention a machine
reads has to hold every time, or the version it produces is wrong.

## What you will get from this module

Not a style guide - a working command of three things: how to write a commit
whose **type, scope, and breaking marker** are chosen deliberately; how those
commits **drive Semantic Versioning** and flow into a release-please Release-PR,
changelog, and tag; and where a commit sits in the **trunk-based, protected-main**
model that gates every release. After this, you can write commits that version
and release the code correctly.
