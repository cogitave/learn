Every guarantee you make about an agent — that it is isolated, that its memory is
private, that its actions are recorded — is only as strong as the layer enforcing
it. If that layer belongs to somebody else, the guarantee is a rental agreement.

**Yuva is Cogitave's answer to that.** It is a from-scratch, agent-native
sovereign kernel and micro-VMM, written in `no_std` Rust, built to own the
hardware it runs on rather than to sit as a process inside another operating
system.

This unit develops the argument for *why* that is worth doing at all; the next
unit turns the argument into something checkable. Neither is a hands-on module,
and that is deliberate — see the status note below for why.

## The problem an application framework cannot solve

Look at how agent infrastructure is usually split today: a sandbox owns the
computer — the virtual machine, the file system, the process tree (services like
E2B). A memory layer owns the agent's context — message history, retrieved
facts, tool definitions (services like Letta). A scheduler owns the run loop —
which step runs next (services like AIOS). Each does its one job well, and none
of them owns the seam between the others.

That seam is where the risk lives. Suspending an agent mid-task means suspending
its context, its memory, its in-flight model call, and its sandbox and file
system state — together, as one unit — or you resume into a state that never
actually existed. Nobody who owns only one of those pieces can make that
guarantee, because making it requires authority over all of them at once. That
is not a problem you solve with more integration code between the pieces; it is
a question of which layer has the standing to freeze, move, or fork all of it
atomically. That layer is the kernel, or it is nobody.

## Why that kernel can't just be Linux with extra steps

You could imagine enforcing all of that on top of an existing general-purpose
kernel instead of writing a new one. Yuva's design record rejects that path, and
names specific, checkable reasons rather than a preference.

Start with **ambient authority** — the default in most general-purpose
operating systems, where a process starts out able to do everything its user
account is allowed to do, and permissions work by taking authority away
afterward. Shapiro's "programs, not people" critique argues this is a structural
mismatch once the thing running the program is an autonomous actor rather than a
person at a keyboard: an agent fed by third-party content and open to injected
instructions inherits all of that ambient authority by default, before anyone
has decided it should. Yuva does not adopt the default: nothing is ambient, and
every operation runs against an explicit, narrow grant from the moment a task
exists. There is no broad access to narrow down, because none was ever granted.

Or take `fork()` — the call most Unix-family kernels use to create a new process
by cloning the one that's running. A 2019 systems paper ("A fork() in the road,"
Baumann et al., HotOS '19) argues it is a poor match for how modern kernels
actually work. Yuva does not have it: a task is spawned from an explicit
manifest with an explicit capability grant, never produced by cloning an
existing process and hoping its authority gets narrowed back down correctly
afterward.

Neither example is a defect Cogitave found in Linux. They are decisions built
into what a general-purpose kernel *is* — designed for many programs serving
many human users, decades before an autonomous agent was a workload anyone had
in mind. Retrofitting them is possible; Yuva's position is that a kernel whose
job is "authority belongs to nobody until it's explicitly granted" is easier to
get right by starting there than by narrowing something built the other way
around, one sandbox layer at a time.

## What "sovereign" means here

Sovereign does not mean zero dependencies — no kernel escapes the hardware
underneath it. Yuva's own design record sorts every dependency it has into one
of four buckets: what silicon simply mandates (the CPU's instruction set, its
privilege rings, the layout its memory-management unit expects — Yuva complies
because there is no alternative); a small number of open, neutral standards that
no single vendor controls (the virtio device protocol, ratified by OASIS; the
devicetree hardware-description format) and that Yuva adopts because they are
OS-neutral, not because they came from an existing kernel; the pieces of
Linux/Unix design named above, which Yuva rejects outright; and everything else,
which Cogitave writes and owns.

Sorted that way, the debt comes out narrow: physics, and a couple of standards
bodies — not a general-purpose kernel whose next release you don't control and
whose design you didn't choose. That is what makes a guarantee **attestable**
rather than merely asserted: if everything enforcing it is either unavoidable
physics, an open standard anyone can read, or Cogitave's own code, there is
nothing left that only a vendor's word would have to vouch for.

## The layering

Yuva is a different layer from the kernel you used in the previous module, and the
two are not one stack:

| | Namzu | Yuva |
| --- | --- | --- |
| Language | TypeScript | `no_std` Rust |
| You get it from | npm | source; it boots on hardware |
| Runs | on Node | as the machine |
| Use it today | Yes | Not to host workloads — see below |

Namzu is the kernel you already used: it isolates and schedules an agent's work
today, on infrastructure — Node, and whatever host runs it — that Namzu itself
does not have to own down to the metal. Yuva is the layer meant to enforce
guarantees like isolation itself, on hardware Cogitave controls, instead of
borrowing them from an operating system Cogitave doesn't. They are not two
competing ways to do the same job today; the status note below says exactly why.

## What "checkable" turns out to mean

Saying a kernel enforces its guarantees is not the same as showing it. The next
unit takes each piece of the argument above and asks what would have to be true
for it to be checkable rather than asserted: how the code that has to touch
hardware directly is kept in one place instead of scattered through the
codebase, what it actually means for a component to be proved rather than
merely tested, what a boot that refuses to claim success it hasn't earned looks
like, and how the kernel states what it deliberately hasn't switched on yet
instead of staying silent about it.

## Status: read this before planning against it

Yuva reports its own limits rather than implying capability it does not have. Its
README states them in uppercase, and this module repeats them rather than
softening them.

> [!IMPORTANT]
> **Live inference is MOCK. Learning is DORMANT** (gate-not-met). Yuva today is a
> verified boot and a verified kernel substrate — it is **not** a runtime you can
> deploy an agent onto. If you want to run an agent now, that is Namzu on Node.

## What you will get from this module

Not a running agent — an accurate model of why a sovereign kernel is worth
building, what "verified" means when someone claims it, and how to read Yuva's
own honesty signals.
