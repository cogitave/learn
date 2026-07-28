"Verified" is a word that gets used loosely. This unit is about what it means
concretely in Yuva, so you can judge the claim rather than take it.

## 1. Unsafe code is confined, not avoided

Yuva is `no_std` Rust with **zero `unsafe` blocks above one audited HAL crate**.
A kernel cannot avoid unsafe code entirely — it talks to hardware. What it can do
is put all of it in one place.

The distinction matters because auditing is a human activity with a budget. Unsafe
code spread across a codebase cannot be reviewed as a unit; unsafe code confined
to a single hardware-abstraction crate can be, and re-reviewed whenever it changes.

## 2. Selected leaves are formally proved

Some components are proved with **Kani**, a model checker for Rust: rather than
testing a sample of inputs, it explores the state space to show a property holds
for all of them.

Two details make this more than a badge:

- The proof set covers **leaves** — small, self-contained components — because
  that is where model checking is tractable. Nobody proves a whole kernel.
- **The harness counts are pinned in CI.** If a proof disappears, the build fails.
  A verification claim that can silently shrink is not a claim.

## 3. It boots two architectures on every push

`x86_64` and `aarch64`, on every commit. Portability that is not exercised is
portability that has already broken; the only honest way to claim it is to run it
continuously.

## 4. The boot fails closed

This is the property worth internalizing.

Yuva does not report a successful boot unless the **full cumulative self-test
marker chain** prints over serial. A missing marker is a failed boot — not a
warning, not a degraded mode, not a log line somebody notices next week.

| | Fail-open | Fail-closed |
| --- | --- | --- |
| A check does not run | Boot succeeds anyway | Boot fails |
| A guarantee is unproven | Assumed to hold | Treated as broken |
| Who notices | Whoever is paged later | CI, immediately |

Fail-open systems accumulate silent gaps: each individually looks like a small
missing check, and together they mean nobody knows what is actually enforced.

## 5. It states what is not working

Yuva reports **honesty tokens** over serial — uppercase status markers that say
which capabilities are not live. Today they say live inference is MOCK and
learning is DORMANT because a gate has not been met.

This is an engineering practice, not modesty. A system that reports only its
successes cannot be reasoned about, and a status page that never says NO is not
telling you anything. The tokens are also the signal to watch: they change when
the gate is met.

> [!TIP]
> When you assess any platform's verification claim, ask the four questions this
> unit answers: where is the unsafe code, what exactly is proved, can the proof
> set shrink without anyone noticing, and what happens when a check does not run.
