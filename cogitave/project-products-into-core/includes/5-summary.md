You can now explain why Cogitave treats content as one graph rather than a
collection of silos, and how that graph stays honest as it grows.

In this module, you:

- Learned the thesis from the
  [Core architecture spec](../../../../core/docs/architecture.md): docs, the
  IDP, governance, and infra are **projections of one graph**, never separate
  stores.
- Traced how a source document becomes a node: the **ACQUIRE-to-PUBLISH**
  pipeline, the **UID**/**contentHash** identity scheme, and the closed edge
  set (`xref`, `partOf`, `appliesTo`, `teachesSkill`) that links it in - served
  identically to humans and agents through `docs_fetch` and the
  `cogitave://{type}/{id}` resource surface in the
  [MCP interface](../../../../core/docs/mcp-interface.md).
- Learned why linked edges are not the whole propagation story: the
  [knowledge-propagation standard](../../../../standards/docs/standards/knowledge-propagation.md)
  names **restatement drift** and fixes it with a **fact registry** - one owner
  document per fact, everything else cites - checked by a deterministic
  **fact-drift scanner**.
- Read Core's status honestly: it is a **specification and architecture today**;
  the registry and scanner already run over files on the mirror, and full graph
  projection lands when Core runs.

## You have completed the path

This was the final module of **Build on Cogitave Core**. Completing it earns
the path's trophy - you now have a working model of the one graph every
Cogitave product, standard, and agent shares, and how to keep it truthful as
content grows.

## Where to go next

- @cogitave.learn.paths.build-on-core - return to the path to claim your
  trophy.
- [Core architecture](../../../../core/docs/architecture.md) - re-read the
  full node/edge model and the change pipeline at the source.
- [Knowledge-propagation standard](../../../../standards/docs/standards/knowledge-propagation.md) -
  the fact registry format, mention rules, and the impact-map skill in full.
