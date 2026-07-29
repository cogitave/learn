The naming rules give you plain, keyword-first *functional* names. A **codename**
is a different thing: the durable internal identity of a *product* or major
initiative. Confusing the two is the most common naming mistake, so this unit
keeps them apart.

## Keyword-first, no redundant prefix

An AI-native org names functional artifacts with **plain keywords** and drops the
redundant org prefix, because the parent org or folder already provides
the namespace. This is the decision Cogitave records in
[ADR-0007](../../../../standards/docs/decisions/0007-keyword-naming.md): names are
keyword-based and plain - `bootstrap`, `core`, `standards` - not
`cogitave-bootstrap`. Where a GitHub org login must be globally unique, the
clean-name-to-login mapping lives in `estate.yaml` so the local name stays simple.

## What a codename is

The [codename standard](../../../../standards/docs/standards/codenames.md) defines
a codename as a **short, evocative, single-word name for a foundational concept**,
drawn from ancient and root languages. Cogitave calls this lexicon **Roots**, and
it is seeded by the two existing products:

- **`yuva`** - nest, home, dwelling: the place agents live and run (the Agent OS).
- **`namzu`** - name, naming, designation: what defines an agent (the Agent
  Kernel).

The family rule keeps a codename a single lowercase token of one to three
syllables, with no spaces, hyphen, or number, mapping to a foundational concept
whose connotation fits the product. The Roots lexicon is **promotion-grade by
design** - `yuva` and `namzu` are already public names too.

## Three names, kept distinct

A product can carry three names, bound together in the codename **registry**:

- **Codename** - the Roots token; one per product, its durable internal identity.
- **Public / marketing name** - what customers see, usually the same token.
- **Repo name** - a plain keyword. It is **either** the codename, when the product
  leads with its name (`yuva`, `namzu`), **or** the descriptive category keyword,
  when the category is the clearest identifier (`browser`, `editor`).

> [!CAUTION]
> **Never concatenate** a codename with its category - not `yuva-os`,
> `duru-browser`, or `editor-kalem`. The registry holds the mapping; the name
> stays simple. This is the same no-redundant-prefix principle applied to
> products.

## When a codename is allowed

- **One codename per product** or major externally-distinct initiative, for its
  lifetime.
- **Platform and infrastructure primitives are codename-exempt.** `core`,
  `bootstrap`, `standards`, `agents`, `infra` run under their **descriptive
  keyword** names - they are substrate, not marketed surfaces.
- **Allocation is gated, not first-come.** A name is `proposed` only after a fast
  **knockout** check (trademark registers, package and handle availability,
  internal collision, cross-language safety); it goes `active` only with founder
  sign-off and full legal **clearance**. A retired codename is tombstoned, never
  reused.
