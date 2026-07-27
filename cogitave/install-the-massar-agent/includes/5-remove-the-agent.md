Each installer ships a matching uninstaller that undoes what it did. This unit covers what each one removes, in what order, and - just as importantly - what a clean removal does not touch.

## Linux: `sudo ./uninstall.sh`

When `install.sh` finishes, it tells you exactly how to undo it: `sudo ./uninstall.sh`. The uninstaller ships next to the installer in `install/`.

```bash
sudo ./install/uninstall.sh
```

In order, it:

1. Requires root.
2. Disables and stops `massar-agent.service` if it's registered - `systemctl disable --now`, tolerating a unit that's already gone.
3. Deletes the unit file at `/etc/systemd/system/massar-agent.service` and reloads systemd.
4. Removes the binary at `/usr/local/bin/massar-agent`.
5. Removes `/etc/massar` entirely, including `agent.env` and the device's token with it.

The script is idempotent: it guards the service lookup and uses `rm -f` / `rm -rf`, so running it twice, or on a machine that was never fully installed, does not error. It prints `[OK] Massar agent removed.` when it's done.

## Windows: Settings > Apps, or `uninstall.ps1` directly

From the OS's own uninstall surface:

**Settings > Apps > Installed apps > Cogitave Massar > Uninstall**

- which runs the copy of `uninstall.ps1` the installer staged, via the `UninstallString` it registered. Or run it yourself, as Administrator:

```powershell
.\install\uninstall.ps1
```

In order, it:

1. Requires Administrator.
2. Stops the service with `Stop-Service -Force` if it isn't already stopped, then deletes the registration with `sc.exe delete`.
3. Removes the **Settings > Apps registry entry before the files** - deliberately, so a partially completed removal can never leave a listed app whose uninstaller has already been deleted out from under it.
4. Deletes everything under the install directory except the script currently running, then hands off to a detached, hidden PowerShell process that sleeps two seconds and deletes the directory itself once the original process has exited - a script cannot delete the folder it's executing from while it's still running.

It prints `[OK] Massar agent removed.` when done. Removal is best-effort and idempotent (`-ErrorAction SilentlyContinue` throughout), so re-running it on an already-clean machine is safe.

## The release proves its own install path

Cogitave's release pipeline gates each release on a clean-room install of the freshly built artifact. The `verify-install` job in `release-artifacts.yml` runs `install.sh --verify` to confirm the preflight passes, then downloads the just-built `massar-agent-linux-x86_64` and its `.sha256` straight from the release, checksum-verifies the binary, marks it executable, and asserts it runs. The workflow's own comment states the intent:

> Clean-room: run the installer against the freshly published Linux artifact and assert the binary lands + reports its version (mirrors namzu's consumer gate).

A release isn't trusted until its own install path has been exercised against a real, freshly built artifact - not just built and uploaded. The job proves the install and download path; it does not run the uninstaller. Each installer still ships a matching `uninstall.sh` / `uninstall.ps1` alongside it, and on Windows the installer also wires that script into Settings > Apps.

## What removal does - and does not - erase

Removal deletes what lives **on the device**: the binary, the config (and the token inside it), the service registration, and, on Windows, the Settings entry. It does not, and structurally cannot, touch anything on the Diyar side. Every session an operator ran against this device while the agent was active was authorized by Diyar RBAC and recorded there - that history is Diyar's record of what happened, not a local log the agent keeps, so uninstalling the agent has no effect on it. If you need session history removed as well as the device, that's a Diyar-side data question, not something either uninstaller is positioned to answer.
