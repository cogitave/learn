You can now describe precisely what installing Cogitave Massar on a device
exposes - and what it deliberately does not.

In this module, you:

- Learned where Massar sits in the Cogitave cloud: the device end of a
  remote-console feature, dialing the broker's fixed agent path while an
  operator's xterm.js browser terminal renders the other side of the same
  session.
- Learned what Massar is and the one job its agent performs: dial out to the
  Diyar console broker, and when told to, bridge a real PTY and shell back
  over that one connection - the same binary proven end to end on Windows
  (ConPTY) and Linux (openpty).
- Explained why the dial-out model needs no inbound port and no VPN, and how
  the systemd unit's `DynamicUser` / `NoNewPrivileges` / `ProtectSystem=strict`
  sandboxing locks the service down to exactly that job.
- Described the three parties in a session (the agent, the Diyar console
  broker, the operator's browser terminal) and the wire rule that separates
  them: WS Text frames carry control messages (`open` / `resize` / `close` /
  `exit`), WS Binary frames carry raw terminal bytes.
- Described how a device authenticates with a per-device bearer token, how
  Diyar's own RBAC and audit trail - not Massar - authorize and record an
  operator's session, and why no PTY is ever left standing between sessions.
- Learned, honestly, what ships today versus what is a preview: the CLI
  installer with a static token is the real enrollment path (the graphical
  device-code wizard is UI only; its backend is not implemented), and Windows
  and Linux are the only supported platforms today - macOS is deliberately
  deferred.

## Next steps

- @cogitave.learn.install-the-massar-agent - the next module in **Get started
  with Cogitave Massar**, where you install the agent on Linux or Windows,
  trace a real session, and remove it cleanly.
