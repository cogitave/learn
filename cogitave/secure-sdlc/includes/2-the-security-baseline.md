The baseline is the set of controls every product in an AI-native org is built
on. Cogitave's [Security Standard](../../../../standards/docs/standards/security.md)
owns them in its own estate; this unit teaches you to recognize each one and where
it lives.

## Secure-by-design and secure-by-default

Two principles are **required** of every product and service, mapped to the CISA
Secure-by-Design pledge in the
[Secure Development Lifecycle Standard](../../../../standards/docs/standards/secure-development-lifecycle.md):

- **Secure-by-design.** Threat modeling happens at the architecture phase, not
  after code exists. Design for **least privilege**, **defense-in-depth**, and
  **zero trust** - every boundary authenticates and authorizes - and **fail
  secure** (deny on error). No backdoors, no hardcoded credentials.
- **Secure-by-default.** The out-of-box configuration is the safe one:
  deny-by-default network posture, encryption in transit and at rest on,
  debug and verbose-error surfaces off, audit logging on. A user must take a
  deliberate, recorded action to become **less** safe, never to become safe.

## Identity and access management

IAM is scoped to three kinds of principal, each least-privilege:

- **Human.** SSO/SAML with SCIM provisioning and deprovisioning, RBAC, and prompt
  deprovisioning.
- **Workload.** No static keys - **OIDC** (for example GitHub Actions to cloud),
  moving later to SPIFFE/SVID workload identity.
- **Agent.** Agent identity and authority are **first-class**: an agent acts under
  its own identity and an explicit capability and sandbox grant, never an ambient
  or borrowed one.

## Secrets, PKI, and threat modeling

Secret management is **centralized** - no secrets in repos or folders - and key
lifecycle (SSH commit-signing keys, release-signing keys, rotation policy)
produces non-repudiation evidence. **Threat modeling** is a named control done
per feature or system, STRIDE-style, with a dedicated threat model for the Yuva
agent OS. Vulnerability management runs Dependabot, secret scanning, and code
scanning (CodeQL) with remediation SLAs, and an incident-response plan covers
roles, severity, and postmortem.

## The controls are enforced in-repo

The baseline is not advisory. It is enforced by controls that live in the
repository itself: **CODEOWNERS** for separation of duties, a branch **ruleset**,
**gitleaks**, **signed commits**, secret **push protection**, a least-privilege
`GITHUB_TOKEN`, and an allowed-actions allowlist.

> [!NOTE]
> The Security Standard owns these controls; it does **not** own the process that
> applies them stage by stage. That is the next unit - the secure development
> lifecycle - which references these controls rather than restating them.
