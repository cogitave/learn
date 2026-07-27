Reading about a decision tree is not the same as walking one. Here are three
short walkthroughs, one per guide, each ending at the guide's own prescribed
answer with the reasoning that got there.

## Walkthrough 1 - database selection: "we need full-text search"

A product team needs to add full-text search over a document corpus. Open
[database selection](../../../../standards/docs/standards/database-selection.md)
and walk its five-step decision tree:

1. **Access pattern** - full-text / semantic / graph traversal. That is the
   first branch, and it does not fall through to the relational default.
2. The [Cogitave override](../../../../standards/docs/standards/database-selection.md)
   applies: the default for full-text, vector similarity, and relationship
   traversal is **Cogitave Core's query layer** - fused BM25, in-process
   HNSW, and property-graph traversal - **not** a standalone Elasticsearch,
   pgvector deployment, or Neo4j.
3. **Answer: Core's query layer.** Standing up Elasticsearch instead would be
   a deviation requiring a **measured recall or memory ceiling** and an ADR.

Notice what did *not* happen: nobody asked "Postgres or Mongo?" The access
pattern short-circuited the tree before the Postgres-first default was even
relevant.

## Walkthrough 2 - infrastructure selection: "we need a long-running API service"

A team is shipping a long-running Go service that serves live product
traffic. Open
[infrastructure selection](../../../../standards/docs/standards/infrastructure-selection.md)
and walk its compute decision tree (section 1, "Compute"):

1. Is it global, per-request, tiny stateless logic? No.
2. Is it event-driven, spiky, low-baseline glue between managed services? No -
   it is long-running and stateful.
3. Is it a long-running / stateful / latency-critical service? **Yes.**
4. **Answer: a container image, distroless, on managed Kubernetes** - the
   Cogitave default for exactly this shape.

A **VM autoscaling group** instead would be an ADR-gated deviation requiring a
measured reason - OS control, a GPU, or cold-start economics containers
cannot meet.

## Walkthrough 3 - model selection: "a new, correctness-critical compliance summary"

A team is building a new agent flow that drafts a compliance summary - high
stakes, no prior eval evidence. Open
[model selection](../../../../standards/docs/standards/model-selection.md):

1. Is the task **new or correctness-critical**? Yes - there is no golden
   output set yet and being wrong is costly.
2. The guide's default fires directly: **start at the most capable Claude
   tier** (Tier 1) to establish the correctness bar and a golden output set.
   Do not start cheap and hope.
3. Only later, once that golden set exists, does the confidence-gated cascade
   apply: route the confirmed-simple slice of the work to a cheaper tier,
   gated by an **eval** showing it holds the quality bar, escalating hard
   cases back up on low confidence.

Moving this task to a cheaper tier without that eval would be an unrecorded,
unjustified deviation - exactly what the guide's deviation rule forbids.

## The pattern behind all three walkthroughs

1. **Open the guide, not your memory.** Defaults and model IDs can be
   superseded; the guide is the source of truth, not a recollection of it.
2. **Walk the tree in order and stop at the first forcing step.** The tree
   exists so the *shape of the workload*, not preference, decides.
3. **If you land on the default, nothing to record.** If you deviate, you now
   know what the ADR (or the eval, for model selection) must state: the
   workload/task, the measured ceiling or eval delta, the chosen option's
   trade-offs, and a migration or escalation path.

> [!TIP]
> When in doubt whether something is a "measured need," ask whether you have
> a benchmark or a production signal - not a hunch - tied to a stated
> [reliability](../../../../standards/docs/standards/reliability.md) SLO or
> error budget. That is the bar every deviation rule uses.
