[ADR-0021](../../../../standards/docs/decisions/0021-technology-selection-guidance.md)
records why these guides exist and where they sit. Before this ADR, nothing
mapped a *workload* to a *store* or a *compute runtime* - each team re-derived
the mapping, the answers drifted, and, in an MCP-native estate, an agent could
not answer "recommend a store for workload W" because the mapping was not
written down as data anywhere. The ADR closes that gap with a **three-layer
guidance model**.

## The three layers

| Layer | Question | Artifact |
| --- | --- | --- |
| **Selection** | *which* family for *which* workload/task | database-selection, infrastructure-selection, model-selection |
| **Radar** (rings) | *what* is adopted at each layer | [technology-radar](../../../../standards/docs/standards/technology-radar.md) |
| **Domain** (how-to) | *how* to build with the choice | [naming](../../../../standards/docs/standards/naming.md), [reliability](../../../../standards/docs/standards/reliability.md), [saas](../../../../standards/docs/standards/saas.md), and the rest |

The selection guides **consume** the radar's ring for each option - they never
re-rank it - and **defer** every build-time detail to the domain standards.
Model selection is explicitly the "third sibling" alongside database and
infrastructure selection, governed by the same ADR.

## The shape every guide follows

Read any of the three guides and you will find the same four pieces, in this
order:

1. **A stated default.** Database selection defaults to **Postgres** (or
   Cogitave Core's query layer for full-text, vector, and graph workloads).
   Infrastructure selection defaults to **containers on managed Kubernetes**
   for a long-running service. Model selection defaults to the **most capable
   Claude tier** for any new or correctness-critical task.
2. **A real, walkable decision tree.** Each guide gives an ordered flow -
   database selection's five-step tree (access pattern, consistency, query
   shape, scale, cost), infrastructure selection's per-capability flowcharts,
   and model selection's criteria table (reasoning depth, latency, context,
   cost, modality, tool-use, structured output). Walk the tree in order and
   stop at the first step that forces a non-default answer.
3. **A deviation rule.** You may land somewhere other than the default only on
   a **measured need** - a benchmark or production signal, tied to a
   [reliability](../../../../standards/docs/standards/reliability.md) SLO or
   error budget, never a hunch - recorded in an ADR (or, for model selection,
   an eval showing a cheaper tier holds quality). This is the
   [technology radar](../../../../standards/docs/standards/technology-radar.md)'s
   own rule inherited verbatim: *deviate with an ADR and a migration path off
   the bootstrap.*
4. **A machine-readable matrix.** Each guide's decision tree is also carried as
   valid YAML (for example
   [data/database-selection.yaml](../../../../standards/docs/standards/data/database-selection.yaml)),
   projected into Cogitave Core as a queryable reference node. A human reads
   the prose tree; an agent resolves the same answer via `docs_search` /
   `query_graph` over the identical data - see
   [Core's MCP interface](../../../../core/docs/mcp-interface.md).

> [!NOTE]
> Model selection's deviation rule has a second gate the other two do not:
> moving a task to a **lower** tier always needs eval evidence, and only a
> Tier-4 (distilled/self-hosted) build additionally needs an ADR plus a
> [model-training](../../../../standards/docs/standards/model-training.md)
> project. Escalating **up** for correctness needs no ADR at all - correctness
> is always allowed to cost more.

## Why "the default needs nothing recorded"

Choosing Postgres, a container on k8s, or the most capable tier for a new task
needs **no ADR** - it is simply following the guide. Only *leaving* the
default is a decision that must be recorded, because that is the moment
operational burden, consistency complexity, or cost is traded for something
the default does not give you, and a reviewer or an agent needs to see why.
