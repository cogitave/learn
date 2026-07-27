You can now build with the secure SDLC: you know the baseline of controls a
Cogitave product carries, and the lifecycle that turns them into a gate at each
stage.

In this module, you:

- Separated the **controls** the
  [Security Standard](../../../../standards/docs/standards/security.md) owns -
  IAM for humans, workloads, and agents, secrets and PKI, security operations,
  and threat modeling - from the **process** the
  [Secure Development Lifecycle Standard](../../../../standards/docs/standards/secure-development-lifecycle.md)
  owns.
- Learned the baseline: **secure-by-design and secure-by-default**, least
  privilege, and IAM, enforced by in-repo controls (CODEOWNERS, rulesets,
  gitleaks, signed commits, push protection).
- Mapped **security as a gate** onto each lifecycle stage - a STRIDE threat model
  at the design gate, SAST and secret-scan at implement, the test tiers at
  verify, SBOM and signing at release, and exploit-aware (CVSS x EPSS)
  remediation SLAs after.
- Saw the two Definition-of-Done gates - **S1** (threat-model-reviewed) and **S2**
  (no new High or Critical) - that make the lifecycle enforceable per change, and
  that security is a builder-owned automated gate, not an end-of-line team.

## Next steps

- [Secure Development Lifecycle Standard](../../../../standards/docs/standards/secure-development-lifecycle.md) -
  the canonical process, including the full SDL-to-lifecycle table, the testing
  tiers, and the OWASP LLM Top 10 coverage.
- [ADR 0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md) -
  why security-by-design with STRIDE as the default was chosen over a
  security-as-team model, if you want the reasoning behind the defaults.
