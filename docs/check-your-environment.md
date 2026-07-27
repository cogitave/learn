---
uid: cogitave.learn.docs.check-your-environment
title: Check your environment
description: Use the namzu operator CLI to verify a machine before debugging an agent - runtime version, installed packages, and whether the provider you registered is actually reachable.
type: how-to
owner: cogitave/platform
lastReviewed: 2026-07-26
products:
  - namzu
roles:
  - developer
  - platform-engineer
level: beginner
order: 2
status: draft
---

# Check your environment

When an agent misbehaves, the first question is whether the problem is your code
or the machine underneath it. `@namzu/cli` answers that question before you start
reading your own logic.

## Install the CLI

```bash
pnpm add -D @namzu/cli
```

It works as a project-local bin or as a library, so you can call the same checks
from your own tooling instead of shelling out.

## Run the check

```bash
pnpm namzu doctor
```

`doctor` inspects the environment rather than your agent: the runtime version
against the supported floor, which Namzu packages are present, and whether the
provider you have configured can actually be reached.

> [!TIP]
> Run `doctor` in CI as the first step of the job. A failure there tells you the
> runner is wrong; a failure later tells you the change is wrong. Separating
> those two saves the argument about whose fault a red build is.

## Order of elimination

Work down this list before opening your agent code:

1. **Node version.** The floor is 20. A machine below it fails in ways that look
   like library bugs.
2. **Packages present.** The kernel installed without a provider driver falls back
   to `MockLLMProvider` - which succeeds, and returns nothing you asked for. If
   responses look synthetic, this is usually why.
3. **Provider reachable.** For a local driver, that means Ollama or LM Studio is
   actually running and has the model pulled. For a hosted driver, it means the
   credential is present in the environment.
4. **Then** your agent.

## Current scope

> [!NOTE]
> `namzu doctor` is the command the operator CLI ships today. Other commands are
> planned but not published, and this page will list them when they exist rather
> than in advance.

## Next steps

- [Choose a provider](choose-a-provider.md) - which driver you should have installed.
- [Packages](packages.md) - the supported runtime floor and install shapes.
