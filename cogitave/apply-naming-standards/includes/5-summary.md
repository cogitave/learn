You can now name a new artifact the way an AI-native org does, and tell a functional
keyword apart from a product codename.

In this module, you:

- Learned the **cross-cutting naming principles** from the naming standard -
  keyword-first, no redundant prefix, casing by role, immutable IDs with
  mutable facts in metadata - and that naming is **machine-enforced** by CI
  gates, not reviewer goodwill.
- Named the things you touch first: repos as plain kebab-case keywords, UIDs as
  dotted immutable IDs, code identifiers cased by role per language, files and
  root markers by their convention, and branches as
  `type/ISSUE-ID-kebab-description`.
- Separated a **functional keyword** from a **product codename**: the Roots
  lexicon, the codename-versus-public-name-versus-repo-name distinction, the rule
  that you **never concatenate** the two, and when a codename is allowed versus
  when a primitive is codename-exempt (ADR-0007, the codename standard).

## Next steps

- @cogitave.learn.commits-and-versioning - how the commit and branch *types* you
  just used carry versioning meaning, the next standard on the engineering path.
- The **naming standard** is the canonical, full per-domain reference (cloud
  tags, databases, observability, events, IaC) in Cogitave's standards
  repository, for when you need a rule this module did not cover.
