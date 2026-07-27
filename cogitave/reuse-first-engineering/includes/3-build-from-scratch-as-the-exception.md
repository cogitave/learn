The previous unit was about components inside the estate: discover an existing
golden component before authoring a rival. The same instinct applies one level
up, to whole engines and tools, with its own decision:
[ADR-0003, "Port best-in-class, rebuild native; references not dependencies"](../../../../standards/docs/decisions/0003-build-from-scratch-reference-not-dependency.md).

## "From scratch" does not mean blind reinvention

Cogitave is an agent OS/kernel company, and stitched-together third-party tools
cannot be harmonic - each ships its own data model, UX, and boundary - so the
moat is vertical integration over one canonical model, Cogitave Core. That
"full-scratch" stance was being misread as **blind reinvention**: rewriting
solved problems for their own sake, slowly and worse. That is explicitly not the
intent. The best engineering teams have already discovered the right shapes for
schedulers, parsers, inference loops, and permission models. Cogitave wants those
shapes - then wants them native and vertically integrated, inside the single
model.

## The decision: port best-in-class, rebuild native

> [!IMPORTANT]
> Port best-in-class references and rebuild them better; do not reinvent
> blindly.

- **References, not dependencies.** Best-in-class tools - DocFX, Tauri, UniFFI,
  Candle, Base UI/Radix, lefthook, release-please, llama.cpp - are the **spec
  and reference implementation studied and ported**, not permanent runtime
  dependencies. Cogitave adopts the *shape*, not the lock-in.
- **Rebuild native, maximum speed.** The rebuild is harmonic (one Core model),
  closest to the machine, and measured against the reference.
- **Reinvent only where you beat the reference.** If a team cannot do it
  materially better - faster, more integrated, more correct, more secure - it
  does **not** reinvent yet. The reference stays a **sanctioned bootstrap
  crutch** behind a stable interface, explicit and scheduled for replacement.
- **Correctness and certification compliance are the goal**, not delivery speed.
- **Operationalized by the Technology Radar.** Every layer names its default,
  the reference it ports, and when to deviate; a changed default is its own ADR.

## When "from scratch" is actually earned

Reinvention is earned, not assumed:

1. Can a best-in-class reference be **ported** (its shape studied and adopted)
   instead of ignored? If yes, start there.
2. Can the native rebuild be **materially better**? If not yet, keep the
   reference as the explicit, time-boxed bootstrap crutch and revisit later.
3. Is the deviation **recorded** as its own ADR, so a reviewer can always answer
   "reference, bootstrap, or native primitive?"

The ADR names its own accepted exception: an off-the-shelf tool is acceptable in
the diagram render layer, because the notation spec itself stays Cogitave's own
reference. That is the pattern to copy - not "no third-party tool, ever," but
"the shape is ours to keep, the implementation is earned."

> [!NOTE]
> Both ADRs converge on one instinct: discover what already exists - internally
> in the registry, externally in best-in-class references - before generating or
> reinventing. [ADR-0013](../../../../standards/docs/decisions/0013-reuse-first-convergent-ai-development.md)
> names its own revisit trigger too: reconsider when the native Core
> duplication checker and registry ship, or the golden-component library proves
> too coarse.
