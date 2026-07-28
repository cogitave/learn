You can now explain why Cogitave is building its own sovereign kernel from
scratch, and how to judge a verification claim instead of taking it on faith.

In this module, you:

- Compared the two layers directly: Namzu is TypeScript, runs on Node, and you
  use it today; Yuva is `no_std` Rust, boots on hardware as the machine
  itself, and is not yet something you host a workload on.
- Explained why an isolation, memory, or audit guarantee is only as strong as
  the layer enforcing it, and why Yuva - a from-scratch, `no_std` Rust kernel
  and micro-VMM - exists to own the hardware directly rather than sit as a
  process inside someone else's operating system.
- Learned the four things that make Yuva's verification claim checkable:
  unsafe code confined to one audited HAL crate, selected leaves formally
  proved with Kani (with harness counts pinned in CI, so a shrinking proof set
  fails the build), a dual-architecture (`x86_64` / `aarch64`) boot exercised
  on every push, and a boot that fails closed - a missing self-test marker is
  a failed boot, not a warning.
- Learned to read Yuva's own honesty tokens: uppercase status markers reported
  over serial that state plainly which capabilities are not live yet.
- Stated Yuva's current status accurately: live inference is MOCK and
  learning is DORMANT (gate not met) - Yuva today is a verified boot and
  kernel substrate, not a runtime you can deploy an agent onto; Namzu on Node
  is where you run an agent today.

That completes the two modules of the "Agent platform fundamentals" path:
building your first agent with Namzu, and now understanding the sovereign
kernel underneath it.

## Next steps

- @cogitave.learn.paths.agent-platform-fundamentals - return to the path to
  claim your trophy.
