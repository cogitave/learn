A Massar session involves three parties and one simple rule for what crosses the wire: text frames carry control messages, binary frames carry terminal bytes. This unit walks through both.

## The three parties

| Party | Role |
| --- | --- |
| **massar-agent** (on the device) | Dials out to the broker, owns the PTY, interprets control frames |
| **Diyar console broker** (in the cloud) | A dumb frame pipe between the agent and the operator - it does not interpret terminal traffic |
| **Operator's browser terminal** | An xterm.js web terminal, connected to the broker's operator-facing endpoint |

The agent connects to the broker's agent endpoint (`/api/v1/console/agent`); the operator's browser connects to the broker's per-device endpoint (`/api/v1/devices/{id}/console`). The broker relays frames between the two sides of a device's session - the agent's own source describes the broker plainly as "a dumb frame pipe; the agent interprets control and owns the PTY."

## The wire protocol

The same rule applies on both hops through the broker (agent-to-broker and browser-to-broker):

- **WS Text frames carry control messages**, as JSON: `open`, `resize`, `close`, and `exit`.
- **WS Binary frames carry raw terminal bytes**: operator-to-agent is what the shell receives as stdin; agent-to-operator is what the shell writes to stdout.

```rust
// Control frame shape the agent deserializes:
struct Control {
    t: String,          // "open" | "resize" | "close"
    cols: Option<u16>,
    rows: Option<u16>,
}
```

When the broker relays an `open` control frame, the agent creates a fresh PTY sized to the given `cols`/`rows` and spawns a shell on it. A `resize` frame adjusts the PTY size for a terminal window that changed shape. A `close` frame - sent by the operator - kills the shell. If the shell exits on its own (the user typed `exit`, or it crashed), the agent sends a `{"t":"exit"}` control frame back so the operator's terminal knows the session ended without waiting on an operator-initiated close.

## A real shell on a real PTY

Massar does not run a restricted command interpreter - it opens an actual pseudo-terminal and spawns the operator's shell on it:

- **Linux:** `openpty`, spawning `$SHELL` (falling back to `/bin/bash`).
- **Windows:** ConPTY, spawning `%COMSPEC%` (falling back to `powershell.exe`).

Both are wired the same way once the PTY is open: a background thread does blocking reads from the PTY's output and forwards each chunk to the broker as a Binary frame; a second thread does blocking writes of whatever Binary frames arrive from the operator, feeding them to the PTY's stdin. A `resize` control frame is the only thing that changes the PTY's dimensions mid-session - the read and write threads never see it.

> [!NOTE]
> On Windows, ConPTY performs a cursor-position handshake (`ESC[6n`) that the terminal client must answer. The xterm.js web terminal does this natively, and Cogitave's own dev test client (`massar-op-test`) was updated to answer it too, so the automated cross-platform relay test passes.

## One session at a time, and nothing left running

The agent tracks at most one open session per connection: a PTY handle, the channel feeding its stdin, and the child shell process. When the connection to the broker drops for any reason - the broker closes it, the network fails, the operator closes it - the agent kills the shell rather than leaving it running. There is no mechanism for a session to persist independent of its WebSocket connection.

## Try it without Diyar

The repository ships a local, dev-only harness that proves this whole path end-to-end without a real Diyar deployment: a local broker, an agent, and a test operator client.

```bash
cargo build --features dev-tools
massar-broker-dev &                          # listens 127.0.0.1:8088
MASSAR_BROKER_URL=ws://127.0.0.1:8088/agent MASSAR_DEVICE_ID=dev MASSAR_AGENT_TOKEN=dev massar-agent &
MASSAR_DEVICE_ID=dev massar-op-test          # PASS = sentinel round-tripped through the PTY
```

> [!IMPORTANT]
> `massar-broker-dev` and `massar-op-test` are dev-only binaries gated behind the `dev-tools` feature - they exist to prove the relay locally, not to stand in for Diyar. All end-to-end proof described in this module is from this local harness; there is no production deployment behind it yet.

Unit 4 covers who is allowed to send that `open` frame in the first place, and what is recorded when they do.
