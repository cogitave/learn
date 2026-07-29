The earlier modules gave you the rules. This one is where you use them.
Contributing to an AI-native, certification-grade codebase means taking even a
small change all the way to a pull request that a reviewer - or an auditor - can
trust: shaped, signed, and documented so it clears a set of mechanical gates
before a human ever looks at it. You will do that once, end to end - the way
every contributor and agent does it in Cogitave's estate, the worked example this
capstone uses.

Nothing here is new policy. It is a non-negotiable floor (Cogitave's is written
in [AGENTS.md](../../../../../AGENTS.md)), the ruleset a repository inherits from
its project baseline, and the propose-only request lifecycle you already worked -
applied to one concrete commit.

## What a passing first contribution looks like

Four things have to be true before your pull request is ready for review. None of
them is optional, and each is checked mechanically. Here is how Cogitave's estate
enforces them - your own org wires up the same four guarantees its own way:

| Requirement | Enforced by |
| --- | --- |
| The commit message is a Conventional Commit | commitlint, in the hook **and** in CI |
| The commit is SSH-signed and shows as Verified | the org branch ruleset |
| No secret is committed; files are formatted | pre-commit hooks, then CI |
| Code changes ship with doc changes | the `docs-required` CI gate |

> [!IMPORTANT]
> You author and open the PR. You do **not** merge it. In an AI-native org agents
> propose and humans enact - merge, apply, and release stay human gates (in
> Cogitave's floor, [AGENTS.md](../../../../../AGENTS.md), non-negotiable rules
> 6-7). Opening the PR is the finish line for this module.

## What you will do

The next two units walk the two halves of the job. First you will write and sign
a single Conventional Commit. Then you will let the gates run, satisfy docs-as-code,
and open the pull request. By the end you will be able to make a contribution that
passes every gate on the first try, and know exactly which check is speaking when
one does not.
