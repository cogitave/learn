The earlier modules gave you the rules. This one is where you use them. You will
take a small change all the way to an open pull request that a reviewer - or an
auditor - can trust, and you will do it the way every Cogitave contributor and
agent does it.

Nothing here is new policy. It is the floor from
[AGENTS.md](../../../../../AGENTS.md), the ruleset a repository inherits from the
project baseline, and the propose-only request lifecycle you already worked -
applied to one concrete commit.

## What a passing first contribution looks like

Four things have to be true before your pull request is ready for review. None of
them is optional, and each is checked mechanically:

| Requirement | Enforced by |
| --- | --- |
| The commit message is a Conventional Commit | commitlint, in the hook **and** in CI |
| The commit is SSH-signed and shows as Verified | the org branch ruleset |
| No secret is committed; files are formatted | pre-commit hooks, then CI |
| Code changes ship with doc changes | the `docs-required` CI gate |

> [!IMPORTANT]
> You author and open the PR. You do **not** merge it. In this estate agents
> propose and humans enact - merge, apply, and release are human gates
> ([AGENTS.md](../../../../../AGENTS.md), non-negotiable rules 6-7). Opening the
> PR is the finish line for this module.

## What you will do

The next two units walk the two halves of the job. First you will write and sign
a single Conventional Commit. Then you will let the gates run, satisfy docs-as-code,
and open the pull request. By the end you will be able to make a contribution that
passes every gate on the first try, and know exactly which check is speaking when
one does not.
