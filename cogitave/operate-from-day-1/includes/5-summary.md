You now have a working answer to "how does Cogitave operate from Day 1": one
model, specified in two layers, from the estate's first day.

In this module, you:

- Learned the **inner loop**: a pinned, reproducible toolchain (`mise`, `just`)
  and the parity contract - `lefthook commands == CI commands == just targets` -
  plus trunk-based delivery with a preview environment on every PR.
- Learned the **outer loop**: WIP-limited continuous flow (Kanban-style) day to
  day, Shape-Up-style betting for larger bets, and the request-lifecycle Request
  as the single unit that flows through both.
- Saw why **ADR-0025 rejected Scrum** for this team - sprint batching against
  trunk-based CD, a gameable velocity metric, and ceremony built for a
  coordination problem this small, autonomy-by-default team does not have.
- Understood that the **WIP limit protects the human-attention budget**, not
  agent throughput, and that the **human gate stays an exception handler** - the
  same doctrine from "Apply the AGENTS floor."

This is the last module in **Operate the estate**. Completing it earns the path's
trophy: you can now describe how the estate runs a change from Day 1, end to end,
under least privilege with every action recorded as evidence.

## Next steps

- [ways-of-working](../../../../standards/docs/standards/ways-of-working.md) - the
  full outer-loop standard; keep it open when your squad stands up its board.
- [development-process](../../../../standards/docs/standards/development-process.md) -
  the full inner-loop contract, including the canonical `just` targets table.
- [ADR-0025](../../../../standards/docs/decisions/0025-flow-based-ways-of-working.md) -
  the decision record, if you want the full landscape survey and the rationale
  behind the choice.
