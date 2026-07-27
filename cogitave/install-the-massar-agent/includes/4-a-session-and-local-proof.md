The agent interprets exactly three control messages and one byte stream. This unit walks a session from open to close, then reproduces the whole relay on your own machine with no Diyar broker involved.

## The wire protocol

Every hop - operator to broker, broker to agent - carries the same two message kinds, symmetric on both sides of the broker:

- **WS Text** = control JSON: `{"t":"open"}`, `{"t":"resize","cols":100,"rows":30}`, `{"t":"close"}`.
- **WS Binary** = raw terminal bytes. Operator→agent is what you type (PTY stdin); agent→operator is what the shell prints (PTY stdout).

The broker itself only ever pipes frames between the two sides; it does not interpret them. The agent is what owns the PTY and reacts to control, which is what makes the broker replaceable - `massar-broker-dev` in this unit and the real Diyar broker both speak the exact same protocol to the agent.

## What happens at each stage

**Open.** `open_session` allocates a fresh PTY (`native_pty_system().openpty`), sized to whatever `cols`/`rows` came with the request or defaulting to 80x24, then spawns the platform's own default shell on it:

```rust
fn default_shell() -> String {
    if cfg!(windows) {
        std::env::var("COMSPEC").unwrap_or_else(|_| "powershell.exe".into())
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".into())
    }
}
```

The shell is started with `TERM=xterm-256color` and, when `HOME`/`USERPROFILE` is available, with that as its working directory. A dedicated OS thread blocks on reading the PTY's master side and forwards every chunk it reads to the broker as a `Binary` frame; a second thread drains a channel fed by incoming `Binary` frames and writes them to the PTY's stdin. Both are ordinary blocking reads and writes on their own threads, deliberately kept off the async runtime.

**Resize.** A `resize` control message with `cols`/`rows` calls the PTY master's own resize directly - no restart of the shell, no new session.

**Close.** An operator-initiated `close` kills the child process outright. Independently, when the shell itself exits - the user typed `exit`, or the process died - the PTY reader thread hits EOF, and the agent sends `{"t":"exit"}` back over the control channel so the operator side learns the session ended instead of just going silent.

There is nothing outside of this lifecycle: the agent holds no standing shell. README is explicit about it: "a PTY exists only for the duration of an explicitly-opened, TTL-bounded session." It is torn down on an operator `close`, on the shell exiting on its own, or on the broker connection dropping - whichever comes first.

## Proving it locally

The full path - operator client, broker, agent, a real PTY, a real shell - runs on one machine with no Diyar account, no network beyond loopback, using the `dev-tools` feature:

```bash
cargo build --features dev-tools
massar-broker-dev &                          # listens 127.0.0.1:8088
MASSAR_BROKER_URL=ws://127.0.0.1:8088/agent MASSAR_DEVICE_ID=dev MASSAR_AGENT_TOKEN=dev massar-agent &
MASSAR_DEVICE_ID=dev massar-op-test          # PASS = sentinel round-tripped through the PTY
```

- **`massar-broker-dev`** is an axum server exposing `GET /agent` (where `massar-agent` dials in and registers itself by `device_id`) and `GET /op` (where an operator attaches; the broker tells the registered agent to `open`, then pipes frames both ways verbatim). Its own doc comment is explicit about what it is not: "NOT for production (no Vent RBAC, no audit, no session recording, no TLS) - those land when this moves into diyar."
- **`massar-agent`** here is the identical binary you would install on a real device - it does not need the `dev-tools` feature to build or run; only the dev broker and the test client require it.
- **`massar-op-test`** attaches to `/op` the same way a browser-based terminal would: it sends a `resize`, types `echo MASSAR_PROOF_OK\r` followed by `exit\r`, and requires the sentinel `MASSAR_PROOF_OK` to appear **twice** in the transcript - once as the command it typed, once as the shell's own echo of the result - before printing `PASS` and exiting `0`. Fewer than two hits is a `FAIL`, exit `1`.

> [!TIP]
> On Windows, ConPTY sends a cursor-position query (`ESC[6n`, a Device Status Report) the moment the shell starts, and stalls rendering until it gets an answer. A real terminal - the xterm.js web terminal on the operator side - answers this automatically. `massar-op-test` does the same thing (replying `ESC[1;1R`), which is why the automated relay test passes on Windows as well as Linux rather than only on one of them.

## What you'll see if it's working

Both `massar-broker-dev` and `massar-agent` log at `info` level by default (no `RUST_LOG` needed). Across the three processes you should see, in order: the broker logging `agent registered` as `massar-agent` dials in, the agent logging `connected to console broker` and then `session opened` once `massar-op-test` attaches, the broker logging `operator attached`, and finally `massar-op-test` printing the relayed transcript followed by `PASS: sentinel round-tripped through the relayed PTY (2x)`.

| Control message | Direction | Carries |
| --- | --- | --- |
| `open` | broker → agent | nothing (agent defaults to 80×24) |
| `resize` | operator → agent | `cols`, `rows` |
| `close` | operator → agent | nothing |
| `exit` | agent → operator | nothing (shell exited on its own) |

This is the Day-0 proof that actually runs end to end in this repository: the local `massar-broker-dev` / `massar-op-test` harness, not a production Diyar deployment. It's the automated cross-platform relay test the project keeps green (ADR-0002), and it's what you can reproduce yourself before ever pointing a real agent at a real broker URL.
