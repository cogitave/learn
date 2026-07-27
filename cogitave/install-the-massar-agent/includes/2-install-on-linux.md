`install.sh` takes a broker URL and a token and turns them into a running, self-healing systemd service. This unit walks the script's own steps, in the order it actually runs them.

## Run the installer

As root, with the broker URL and per-device token from your Diyar enrollment:

```bash
sudo ./install/install.sh \
  --broker-url wss://diyar.cogitave.com/api/v1/console/agent \
  --token <device-secret>
```

Want to check a machine is ready without installing anything yet? `--verify` runs only the preflight checks and exits:

```bash
sudo ./install/install.sh --verify
```

> [!NOTE]
> ADR-0002 records a one-line `curl … | sh` convenience wrapper as the intended Linux path, but the shipped, source-backed way to install today is running `install/install.sh` from the repository. The release publishes the binary and its supply-chain sidecars, not the installer script.

## What the installer does, in order

1. **Preflight.** Detects OS and architecture from `uname -s` / `uname -m`. Confirms it is running as root (`id -u` must be `0`) and, on Linux, that `systemctl` exists - both are hard failures (`die`), not warnings.
2. **Download and verify.** Downloads `massar-agent-<os>-<arch>` from the GitHub Release matching `--version` (or copies a local `--binary-path` build, for testing before a release exists), checks its SHA-256 against the published `.sha256` sidecar, then verifies the cosign signature unless `--skip-signature` was passed. Only after all of that does it `chmod +x` the staged file and `install -m 0755` it to `/usr/local/bin/massar-agent`.
3. **Write the config.** Writes `/etc/massar/agent.env`:

   ```bash
   MASSAR_BROKER_URL=wss://diyar.cogitave.com/api/v1/console/agent
   MASSAR_AGENT_TOKEN=<device-secret>
   MASSAR_DEVICE_ID=<hostname or --device-id>
   RUST_LOG=info
   ```

   The directory is created `0750`, and the file itself is written under `umask 077` and then explicitly `chmod 0600` - readable only by root, because it holds the device's secret in plain text.
4. **Install the service.** Writes `/etc/systemd/system/massar-agent.service` - from the repo's own `install/systemd/massar-agent.service` if it's sitting next to the script, otherwise an equivalent generated inline - then runs `systemctl daemon-reload` and `systemctl enable --now massar-agent.service`.

When it finishes, `install.sh` prints how to remove the agent again: `sudo ./uninstall.sh`. More on that in "Remove the agent cleanly."

## What the service unit actually grants

The shipped unit runs the agent locked down:

```ini
[Service]
Type=simple
EnvironmentFile=/etc/massar/agent.env
ExecStart=/usr/local/bin/massar-agent
Restart=always
RestartSec=5
DynamicUser=yes
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ProtectControlGroups=yes
ProtectKernelModules=yes
ProtectKernelTunables=yes
RestrictNamespaces=yes
RestrictSUIDSGID=yes
LockPersonality=yes
```

`DynamicUser=yes` means systemd allocates an ephemeral, unprivileged user just for this service - the agent never runs as root. `Restart=always` with `RestartSec=5` matches the actual authority the agent needs: an outbound socket, and, only for the duration of a session an operator explicitly opens, a PTY. Everything else in that list (`ProtectSystem=strict`, `ProtectKernelModules`, `RestrictSUIDSGID`, and the rest) narrows the process down to exactly that.

## Confirm it's active

The installer won't report success until the unit is actually up - after `enable --now` it waits a moment, then runs `systemctl is-active --quiet massar-agent.service` once and `die`s with a pointer to `journalctl` if the unit isn't active. You can run the same checks yourself:

```bash
systemctl status massar-agent
journalctl -u massar-agent -f
```

If the status line reads `active (running)`, the device is now dialed out to the broker, and an authorized Diyar operator can open a session to it. A device that never connects - wrong broker URL, revoked token, no network - shows up as `massar-agent` retrying in the journal rather than as a failed unit, since the agent's own reconnect loop treats a dead connection as routine and tries again every few seconds.
