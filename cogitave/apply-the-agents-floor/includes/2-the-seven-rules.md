The root [`AGENTS.md`](../../../../../AGENTS.md) lists seven non-negotiable rules
under *"Non-negotiable rules (the floor)"*. Here they are in order, each with the
one thing you must remember and the standard that owns the detail.

## 1. English only

All code, comments, commits, docs, identifiers, and PR text are in English. No
other natural language anywhere. This keeps every diff readable by every
contributor and every auditor, regardless of who or what wrote it.

## 2. Conventional Commits 1.0.0

Every commit message is `<type>[scope][!]: <desc>`. The type carries meaning:
`feat` and `fix` drive versioning, `!` or a `BREAKING CHANGE:` footer marks a
break. The rule and its full type list live in
[commits-versioning](../../../../standards/docs/standards/commits-versioning.md).

## 3. Signed commits

Commits are SSH-signed and show as `Verified`. Unsigned commits are **rejected**,
not warned about. Never disable signing to get a commit through.

## 4. Docs-as-code

If code changes, docs change. A change that touches code but leaves
`docs/`, any `*.md`, or the `CHANGELOG` untouched is incomplete. The governing
standard is [documentation](../../../../standards/docs/standards/documentation.md).

## 5. Least privilege

Default deny. Request only the capabilities a task actually needs, and **never
broaden a grant to make a step easier**. Access is through teams and roles, not
per-person grants, with separation of duties between author, approver, and
deployer. See [authorization](../../../../standards/docs/standards/authorization.md).

## 6. Autonomy within the rails is the default

Correctness is enforced by construction, so an agent acts unattended **while it
stays inside its least-privilege grant**, its typed and schema-validated inputs
and outputs hold, policy-as-code passes, its effects are reversible or canaried
under a blast-radius cap, and the eval/red-team gate is green. Every autonomous
action is still traced as WORM evidence. The owning doctrine is
[autonomy-and-oversight](../../../../standards/docs/standards/autonomy-and-oversight.md).

## 7. The human gate is an exception handler, not a routine checkpoint

A human is summoned on an **exception**, not over every correct action: (1) an
automated check fails; (2) confidence is low or the case is novel; (3) drift, an
anomaly, or a policy violation is detected; or (4) an action in the minimal
always-human set - at Day 0 the `apply` / `merge` / `release` / secret-rotation /
org-settings ceiling, plus irreversible-catastrophic actions such as root-CA
ceremonies, billing, mass data deletion, external publication, and sovereignty
changes.

> [!NOTE]
> Rules 6 and 7 are one idea in two halves: strong rails let in-spec work run
> unattended, and the human is the handler for the exceptions. "Agents propose,
> humans enact" is the Day-0 posture the ceiling in rule 7 encodes.
