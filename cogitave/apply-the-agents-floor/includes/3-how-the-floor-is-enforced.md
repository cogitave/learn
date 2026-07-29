A rule that depends on everyone remembering it is not a floor. What makes a floor
load-bearing is that most of its rules are **enforced by construction** - a hook,
a CI gate, an org ruleset, or policy-as-code refuses the violation, so the rule
holds whether the author was a person or an agent. Here is how Cogitave wires each
of its seven rules; the **mechanism** behind each is the transferable part, not
the specific tool names.

## The enforcement map

| # | Rule | What enforces it |
| --- | --- | --- |
| 1 | English only | The floor rule itself; upheld through code review and the auditable-evidence posture (every diff is read by a reviewer or auditor). |
| 2 | Conventional Commits | **commitlint** (`@commitlint/config-conventional`) in the `commit-msg` hook (lefthook) **and** in CI on PR commits and title. |
| 3 | Signed commits | The **org ruleset** rejects unsigned commits; a non-`Verified` commit does not land. |
| 4 | Docs-as-code | The CI **`docs-required` gate**: code changed but `docs/`/`*.md`/`CHANGELOG` did not fails the PR (escape: a `docs-exempt` label). |
| 5 | Least privilege | Default-deny **capability grants**, **org rulesets** (`~ALL` repos), and **CODEOWNERS** review; policy-as-code blocks a violation rather than reviewing it. |
| 6 | Autonomy within the rails | The seven rails: policy-as-code, capability grants, the eval/red-team gate, typed schema validation, reversibility and blast-radius caps, drift detection, and tracing to WORM evidence. |
| 7 | The human gate | The runtime's trace-to-gate stage fires a human only on an escalation trigger or a member of the always-human set. |

Every claim above traces to the floor and its owning standard: commit rules to
[commits-versioning](../../../../standards/docs/standards/commits-versioning.md),
the docs gate to
[documentation](../../../../standards/docs/standards/documentation.md), grants and
rulesets to
[authorization](../../../../standards/docs/standards/authorization.md), and the
rails and gate to
[autonomy-and-oversight](../../../../standards/docs/standards/autonomy-and-oversight.md).

## Blocking versus advisory

Notice the difference between a **blocking** enforcer and an advisory one. The
`commit-msg` hook, the org ruleset, and the `docs-required` gate all **stop the
change** - a bad commit message never lands, an unsigned commit is rejected, a
docs-less code PR fails. Rule 1's English-only expectation, by contrast, is
carried by review rather than by a dedicated bot in these documents; do not
assume a linter enforces it, and do not treat the softer enforcement as a softer
rule.

## Why enforcement is designed in, not bolted on

Cogitave's operating doctrine is **autonomy by default, human on exception**. That
only works if correctness is enforced by the environment: default-deny grants, a
schema that rejects malformed effects, an eval gate that blocks unsafe behavior,
and reversibility as the default effect. The rails - not a standing human over
every action - carry correctness.

> [!TIP]
> When you hit a failing check, the floor's answer is always the same: **fix the
> change, never widen the rule**. Broadening a grant, disabling signing, or
> adding a `docs-exempt` label to dodge the docs gate all violate the floor even
> when they turn a red check green.
