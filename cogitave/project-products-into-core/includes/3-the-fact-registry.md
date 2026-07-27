A graph made of `xref` and `dependsOn` edges only propagates changes along
edges someone actually drew. That is a real gap, and the
[knowledge-propagation standard](../../../../standards/docs/standards/knowledge-propagation.md)
and [ADR-0028](../../../../standards/docs/decisions/0028-knowledge-propagation-and-fact-registry.md)
name it precisely.

## The gap: restatement drift

Two audits of the estate found 21 real defects, almost all the same shape: a
load-bearing fact, retyped as plain prose in a second document, silently
diverging from its source. An ADR restated an SLO ladder as
`99.9 / 99.95 / 99.99` when the canonical ladder was `99.9 / 99.5 / 99.0`; prose
elsewhere said "17 node types" while the schema had grown to 18. Neither
restatement carries an edge, so no graph walk ever caught either one. The
standard names this failure class **restatement drift** and states the fix as
one sentence: **the ADR decides, the standard carries the number, everything
else points.**

## Three layers, each catching what the last one cannot

| Layer | Catches | Mechanism |
| --- | --- | --- |
| L1 Graph | linked references | `xref`/`dependsOn` edges, already in Core |
| L2 Fact registry | unlinked restatements | `facts.yaml` + the fact-drift scanner |
| L3 Impact map | pre-edit blindness | reverse-xref + graph walk + registry lookup |

L1 is the node/edge model and query layer the earlier modules in this path
already cover. L2 and L3 are what this ADR adds, and neither replaces the
graph - they feed it.

## The registry rule: one owner, cite don't restate

An **atomic fact** is a single load-bearing invariant - a number, a ceiling, a
default, a closed list - with exactly **one owner document**. Every other
artifact points at the owner (an `xref`, a relative link, or an include)
instead of retyping the value; a restatement that genuinely helps readability
is registered as a **mention**, which is what makes it visible to the scanner.
Facts come in three classes: `constant` (a fixed value, checked by a pattern
that would have caught the historical drift, e.g. flagging `>=2 reviewers`
where the standard says `>=1`), `counter` (a cardinality, verified by
**recounting the authoritative set** rather than matching a frozen literal - a
"53 standards" count would rot the moment a 54th file lands), and `policy` (a
canonical rule sentence, like `postgres-first`).

## The scanner, and what changes when a fact does

`fact-drift.py` is python3, stdlib-only, deterministic, and read-only: it loads
the registry, scans the estate, and exits non-zero on any drift, as a
**blocking** stage in the quality gate. When a fact genuinely changes, the old
value is never just overwritten - it is **invalidated** with a
`validFrom`/superseded marker (the same bi-temporal discipline as
Zep/Graphiti), so a stale restatement found later traces to the exact value it
echoes. Once Core runs, a registry entry itself becomes a graph node, with a
`derivedFrom` edge to its owner and `xref` edges from every citing artifact.

> [!IMPORTANT]
> **Day-0 honesty.** No Core server is running yet; the registry and scanner
> operate on the mirror as plain files. The standard is explicit that its own
> scanner's **first run is expected to fail**, because the two audits that
> motivated this design found real, unrepaired restatement drift (the node- and
> edge-type counts quoted in prose had lagged the schema before this module was
> written) - and treats that first failure as the gate proving itself, not a
> defect in it.
