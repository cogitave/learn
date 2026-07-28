You now know how a change travels from an idea to `done` in the Cogitave estate,
and how to tell the difference between working on it and finishing it.

In this module, you:

- Learned that a change is a first-class **Request** (`cogitave://request/{id}`)
  that humans and agents drive through the **same seven stages** over MCP -
  intake, evaluate, plan, document, implement, review, done.
- Saw that each stage **produces an artifact** and **passes a gate**, that stages
  **auto-advance on green checks**, and that a human is pulled in only on an
  exception.
- Understood why the two write tools, `request_intake` and `advance_stage`, are
  **propose-only**: they open an issue or PR and stage a draft, and **never**
  merge, apply, or release.
- Read the **Definition of Done** - DoD == 100% *and* a CODEOWNER approval, with
  Core items that cannot be waived - and can now say when a Request is genuinely
  done rather than merely worked on.

You can now find, read, and work a change end to end - the lifecycle every
contribution and every operation runs on.

## Next steps

Where you go next depends on your path:

- **Contributor onboarding** → @cogitave.learn.open-your-first-pull-request - turn
  the lifecycle into an actual signed, Conventional-Commit, docs-complete pull
  request (the final module of that path; completing it earns the trophy).
- **Operate the estate** → @cogitave.learn.run-agentic-operations - see how agents
  run this same lifecycle across the estate under least privilege.
- The **`LIFECYCLE.md`** doc, in the estate's agents tree, is the authority on
  the seven stages; keep it open when you work a real Request.
- The **`definition-of-done.md`** doc has the full checklist the review gate
  enforces.
