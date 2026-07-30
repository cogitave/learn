Security shifts **left** into the existing request lifecycle. The
[Secure Development Lifecycle Standard](../../../../standards/docs/standards/secure-development-lifecycle.md)
adds no new pipeline - it names which security activity each stage owns and which
**existing** gate enforces it, so every stage of a change carries its own gate.

## A gate at each stage

| Lifecycle stage | Security activity | Enforced by |
| --- | --- | --- |
| Requirements | Security requirements + abuse cases; ASVS baseline selected | Definition of Done; security-triage |
| Design | **Threat model** - DFD + trust boundaries + STRIDE register, reviewed before code | RFC/ADR Accepted; DoD **S1** |
| Implement | Secure-coding rules; pre-commit **SAST** + **secret-scan** block on critical/secret | CI + pre-commit hooks |
| Verify | Full security test tier: SAST/SCA/DAST/IAST/fuzz | testing-quality; DoD **S2** |
| Release | SBOM generated + artifact signed + provenance | supply-chain (SLSA/SBOM/cosign) |
| Respond | Continuous monitoring; vulnerability-management SLAs; postmortem | observability; incident response |

The threat-model gate (**S1**) and the no-new-high-or-critical gate (**S2**) are
the two Definition-of-Done security items - the checks that make the lifecycle
enforceable per change.

## The threat model is the core process

The **default** method is **STRIDE over a data-flow diagram** with explicit trust
boundaries. Four questions drive every session: *what are we building, what can go
wrong, what are we going to do about it, did we do a good enough job?* The output
is a living **threat register** - threat, affected element, STRIDE class,
decision, mitigation, owner, status - committed beside the design, not a slide
deck.

A threat model is **mandatory** (DoD S1 cannot be waived) when the request is
design-class, introduces or moves a **trust boundary** (a new external interface,
authn/authz path, tenant boundary, or agent capability edge), or adds a new store
of personal or secret data, a new third-party integration, or a new **agent or
LLM** surface. It is reviewed at the design gate, **before implementation** - a
threat model produced after code is a process failure.

## Verify, remediate, and honesty

The security **test tiers** each run at a defined gate: SAST, secret scan, SCA,
and IaC/container scan are **required**; **fuzz** is required for parsers and
protocol handlers. Pentest and red-team are marked **target**, not a present-day
claim - Day-0 honesty for a small remote team.

Findings flow into one vulnerability lifecycle with SLAs by CVSS severity:
Critical 24-48h, High 7 days, Medium 30 days, Low 90 days. A finding with
**EPSS > 0.5** or on the CISA **KEV** list is elevated one severity tier - probable
real-world exploitation outranks the raw base score. **No new High or Critical**
dependency (SCA) finding may merge; that is the DoD S2 tie.

> [!IMPORTANT]
> Security is an **automated gate owned by the builders**, not a separate team
> that reviews work at the end. A developer-led Security Champions program owns
> the code-review security gate; the security function sets policy and handles
> high-risk reviews rather than gating every PR.

For agent and LLM surfaces the **OWASP Top 10 for LLM Applications** is
first-class in the threat model: prompt injection is the default assumption - all
external and tool content is **untrusted data, never instructions** - and
token-budget, recursion, and timeout caps are required on every agent loop to
bound denial of service.
