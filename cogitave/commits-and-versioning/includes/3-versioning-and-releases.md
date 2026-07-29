You now write the commit; this unit follows it all the way to a released version.
The path is: commit types set the **version number**, an engine assembles a
**Release-PR** and changelog, and the **branching model** gates when the release
happens. All of it is grounded in Cogitave's
[commits-versioning](../../../../standards/docs/standards/commits-versioning.md)
and [branching-release](../../../../standards/docs/standards/branching-release.md)
standards.

## Types drive Semantic Versioning

An AI-native org versions with **Semantic Versioning 2.0.0** - `MAJOR.MINOR.PATCH`
- and your commit types decide which number moves:

- a `fix` bumps **PATCH** (`1.4.2` to `1.4.3`);
- a `feat` bumps **MINOR** (`1.4.2` to `1.5.0`);
- a breaking change (`!` or a `BREAKING CHANGE:` footer) bumps **MAJOR**
  (`1.4.2` to `2.0.0`).

There is one rule that overrides all of this: **pre-1.0.0**. While a package is
still `0.y.z`, *everything - including breaking changes - bumps MINOR or PATCH,
and MAJOR stays at 0 until the project declares 1.0.0*. Pre-release identifiers
order as `1.0.0-alpha.1 < -beta < -rc.1 < 1.0.0`. So a break in a `0.y.z` package
does **not** produce a `1.0.0`; that first major is a deliberate decision.

## release-please assembles the release

Cogitave's release engine, for instance, is **release-please in manifest mode**.
It drives Rust, Go, and TS from a single config and, as commits with releasable
types land on `main`, it opens a **Release-PR**: a pull request that proposes the next SemVer number and a
**Keep a Changelog 1.1.0** entry drained from the `[Unreleased]` section, grouped
into Added / Changed / Deprecated / Removed / Fixed / Security with ISO-8601
dates. The release is **human-approved** - merging that Release-PR is what cuts
the tag and artifact. Agents propose the release; a human enacts it.

A few repo types use a different engine, per the standard's decision table:

| Repo | Versioning engine |
|---|---|
| Rust crate (API breaks matter) | **release-plz** with `cargo-semver-checks` |
| Go binary | release-please tag + **goreleaser** artifact |
| JS-only multi-package monorepo | **Changesets** |

The commit convention and Keep a Changelog output stay the same across all of
them; only the release tooling differs.

## The branching model gates the release

Releases ride on a **trunk-based** flow: `main` is the single long-lived branch
and it is **protected**. You do short-lived feature branches, open a mandatory
PR, and merge with **linear history** and conversations resolved. Force-push is
blocked and deletion restricted by the org ruleset.

Protected `main` requires a PR with at least one **CODEOWNER approval**, stale
approvals dismissed, last-push approval, **signed commits**, and required status
checks - CI, security, and `docs-required` - green. Releases then promote through
**dev to staging to prod**, and the prod environment adds required reviewers, a
wait timer, prevent-self-review, and **admin bypass disabled** for SOC2 CC8.1
separation of duties. Each release drains the changelog, cuts a SemVer tag, and
ships a signed artifact with provenance.

> [!NOTE]
> This is why the commit matters so much: a single mis-typed message flows
> unattended through release-please into a wrong version number. The gates check
> that the release is signed, reviewed, and documented - they do not second-guess
> whether you called a `feat` a `fix`. That judgement is yours.
