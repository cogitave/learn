AI-assisted development diverges unless something deliberately counters it:
similar problems yield similar-but-not-identical solutions, and diff-only review
cannot see an already-existing helper. Cogitave's counter-force is
**retrieval before generation**, stated as a hard rule in the AI-Native
Development standard (decision: ADR-0013), in the estate's standards
repository: discover, compose, and only justify-and-author when nothing fits -
then contribute the result back. That rule only works because there is exactly one
canonical thing to reuse at each layer - tokens, primitives, golden components -
queried through a single MCP-native registry, and it only stays real because
anti-duplication gates (`no-duplication` CI, reuse review, AGENTS.md decision
tables, and the eval harness's reuse metric) catch a needless re-author before it
lands.

The same instinct governs whole engines and tools, not just components:
ADR-0003 says port best-in-class references and rebuild them native only
where the rebuild is materially better - faster, more integrated, more
correct, more secure. Otherwise, the reference stays an explicit, time-boxed bootstrap crutch,
never a hidden forever-dependency, and the Technology Radar records the default
so any component's status - reference, bootstrap, or native primitive - is
always answerable.

Building from scratch is not the default anywhere in this estate. It is a
reasoned exception you can name, and now you can justify one - or recognize when
you should not.
