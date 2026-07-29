Cogitave's estate implements the contract from the previous unit as two named
catalogs - a concrete example of the fleet you would build for your own org.
Both are Day-0 specs, paired as a human-authoritative `.md` and (for the
scheduled catalog) a machine-authoritative `.yaml`, cataloged in
[`agents/README.md`](../../../../agents/README.md) and
[`agents/operations/README.md`](../../../../agents/operations/README.md).

## The five scheduled agents (engineering)

[`agents/scheduled/`](../../../../agents/README.md) runs the engineering
estate. Each one is read-mostly or propose-only and never merges, releases, or
edits `main`:

| Agent | Purpose | Never does |
| --- | --- | --- |
| [pr-triage](../../../../agents/scheduled/pr-triage.md) | Classifies a PR (area, size), applies triage labels, routes it to the right CODEOWNER | Merge, approve, or push code |
| [dependency-review](../../../../agents/scheduled/dependency-review.md) | Evaluates dependency changes for known vulnerabilities, license policy, and provenance | Auto-merge a bump |
| [issue-grooming](../../../../agents/scheduled/issue-grooming.md) | Classifies issues, requests missing repro/version/logs, detects duplicates, surfaces stale ones | Close or delete an issue |
| [changelog-docs-sync](../../../../agents/scheduled/changelog-docs-sync.md) | Drafts the `[Unreleased]` changelog entry and flags the docs a change requires | Edit `main` or bump a version |
| [security-triage](../../../../agents/scheduled/security-triage.md) | Classifies and prioritizes advisories and scan alerts, drafts a triage note | Remediate, merge, or disclose |

## The six operations agents (business)

[`agents/operations/`](../../../../agents/operations/README.md) runs the
business under the same draft-vs-act rule, but its blast radius is often
external and reputational rather than internal:

| Agent | Function | Drafts / proposes | Human gate (owner) |
| --- | --- | --- | --- |
| [content-marketing](../../../../agents/operations/content-marketing.md) | Marketing | Content per the editorial calendar | Editor + claims-review; never publishes |
| [seo-geo](../../../../agents/operations/seo-geo.md) | Marketing | SEO/GEO optimizations, rank monitoring | Marketing owner approves any change |
| [community-support](../../../../agents/operations/community-support.md) | Support | Ticket triage, draft answers, KB-gap detection | Support agent approves any customer-facing reply |
| [revops-lead](../../../../agents/operations/revops-lead.md) | GTM / RevOps | Lead enrichment, scoring, CRM hygiene | RevOps approves merges; never auto-emails a prospect |
| [finops-anomaly](../../../../agents/operations/finops-anomaly.md) | Finance / FinOps | Cost-anomaly alerts, spend reports, proposed actions | Finance approves any spend action |
| [status-comms](../../../../agents/operations/status-comms.md) | Ops / incident response | Status-page and incident comms drafts | Incident commander approves any external post |

## Why the two catalogs read differently

The split teaches a general lesson about blast radius. The
[operations overview](../../../../agents/operations/README.md) names the gap
directly: a scheduled agent's mistake is "mostly internal and reversible - a
label, a comment, a PR suggestion." An operations agent's mistake can "mislead
a customer, leak PII, overspend, or damage the brand" - so its default posture
is **PROPOSE-only by construction**. In Cogitave's fleet, no agent in either
catalog holds a `publish`, `send`, `email`, or `apply` capability; those verbs
are reserved for the human gate, and an attempt to reach them is a
capability-boundary violation, denied and recorded as a security event. That is
the pattern to copy: the higher an agent's blast radius, the more of its verbs
you reserve for a human.

## The kill-switch and the eval gate

Every ops agent MUST be independently disable-able in one action, without a
deploy, by its owner or an incident responder - triggered by a safety-eval
regression, a capability-boundary violation, a confirmed hallucination or
brand incident, a data-protection breach, or anomalous behavior. And per the
three-part contract, no agent's behavior ships at all until it clears the
[eval harness](../../../../agents/evals/eval-harness.md) on accuracy, coverage,
safety, and latency.

> [!NOTE]
> Adding an agent to either catalog is itself governed: author the paired
> spec, register it in the AIMS inventory, define its grant and loop
> placement, and clear the eval gate. Each catalog entry is a **stub** until
> that happens - the standard says so explicitly.
