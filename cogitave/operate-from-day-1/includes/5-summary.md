You now have a working answer to "how does an AI-native org operate from Day 1" -
one model, specified in two layers, from the estate's first day - with Cogitave's
estate as the worked example.

In this module, you:

- Learned the **inner loop**: a pinned, reproducible toolchain (`mise`, `just`)
  and the parity contract - `lefthook commands == CI commands == just targets` -
  plus trunk-based delivery with a preview environment on every PR.
- Learned the **outer loop**: WIP-limited continuous flow (Kanban-style) day to
  day, Shape-Up-style betting for larger bets, and the request-lifecycle Request
  as the single unit that flows through both.
- Saw why **Cogitave's ADR-0025 rejected Scrum** for that team - sprint batching
  against trunk-based CD, a gameable velocity metric, and ceremony built for a
  coordination problem this small, autonomy-by-default team does not have - and
  why that is a decision to record against your own team, not a universal verdict.
- Understood that the **WIP limit protects the human-attention budget**, not
  agent throughput, and that the **human gate stays an exception handler** - the
  same doctrine from "Apply the AGENTS floor."

This is the last module in **Operate the estate**. Completing it earns the path's
trophy: you can now describe how an AI-native estate runs a change from Day 1, end
to end, under least privilege with every action recorded as evidence.

## Next steps

- @cogitave.learn.paths.operate-the-estate - return to the path to claim
  your trophy.
- The **ways-of-working standard** is the full outer-loop standard, in the
  estate's standards repository; keep it open when your squad stands up its
  board.
- The **development-process standard** is the full inner-loop contract,
  including the canonical `just` targets table.
- **ADR-0025** is the decision record, if you want the full landscape survey
  and the rationale behind the choice.
