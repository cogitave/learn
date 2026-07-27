Security bolted on after design is the most expensive and least effective place
to add it. Cogitave's answer is to make security a **design property produced by
a lifecycle** - decided at the requirements and design phase, then enforced by a
gate at every stage a change moves through, all the way to how a vulnerability is
remediated after release.

Two standards carry this, and they divide cleanly:

- The [Security Standard](../../../../standards/docs/standards/security.md) owns
  the **controls** - identity and access management, secrets and PKI, security
  operations, and threat modeling as a named activity. It is load-bearing for
  certification (ISO 27001 / SOC 2).
- The [Secure Development Lifecycle Standard](../../../../standards/docs/standards/secure-development-lifecycle.md)
  owns the **process** that yields secure software: where each gate fires, when a
  threat model is mandatory, and how vulnerabilities are triaged to closure. It
  does not restate controls; wherever it names one, `security.md` is
  authoritative.

The decision to couple these - security-by-design with STRIDE threat modeling by
default, an ASVS baseline, and CVSS/EPSS remediation SLAs - is recorded in
[ADR 0020](../../../../standards/docs/decisions/0020-reliability-and-secure-sdlc.md).

> [!IMPORTANT]
> The point of the lifecycle is **shift-left**: the earlier a class of defect is
> caught, the cheaper it is to fix. Security adds **no new pipeline** - it names
> which security activity each stage of the request lifecycle you already work
> owns, and which existing gate enforces it.

## What you will get from this module

First, the **security baseline** - the controls a Cogitave product is built on:
threat modeling, least privilege, and IAM for humans, workloads, and agents.
Then the **secure development lifecycle** - how those controls become a gate at
each stage, when a threat model cannot be waived, and what blocks a merge. You
will finish able to build with the secure SDLC rather than treat security as
someone else's end-of-line review.
