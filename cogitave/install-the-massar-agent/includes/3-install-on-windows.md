`install.ps1` does the same job as the Linux installer, plus what a real Windows service and an entry in Settings > Apps require. Run it as Administrator.

## Run the installer

```powershell
.\install\install.ps1 -BrokerUrl wss://diyar.cogitave.com/api/v1/console/agent -Token <device-secret>
```

For a locally built, unsigned test binary - before a signed release exists, or against the local dev harness from the next unit:

```powershell
.\install\install.ps1 -BinaryPath .\massar-agent.exe `
  -BrokerUrl ws://127.0.0.1:8088/agent -Token dev -SkipSignatureCheck
```

## What it does, in order

1. **Preflight.** Checks the current principal is in the Administrator role (`WindowsBuiltinRole::Administrator`); anything else is a hard `Die`, since registering a service requires it.
2. **Resolve the binary.** Downloads `massar-agent.exe` from the GitHub Release matching `-Version` (TLS 1.2 pinned via `[Net.ServicePointManager]::SecurityProtocol`) into a temp working directory, or copies a local `-BinaryPath` build.
3. **Verify the checksum.** Compares `Get-FileHash -Algorithm SHA256` against the downloaded `.sha256` sidecar; a mismatch is a hard failure.
4. **Verify Authenticode**, unless `-SkipSignatureCheck`: `Get-AuthenticodeSignature` must report `Valid`, or the installer stops before touching anything else.
5. **Stop and remove any prior service.** If a `massar-agent` service is already registered, the installer stops it (`Stop-Service -Force` when it isn't already stopped) and deletes the old registration with `sc.exe delete`, then pauses a second. Clearing the old service first is what lets a reinstall replace the binary: a running service holds a file lock on the old `.exe`, so it must be stopped before the new one can be copied into place.
6. **Copy the binary** into `$env:ProgramFiles\Massar` (or `-InstallDir`).
7. **Register the service.**

   ```powershell
   New-Service -Name massar-agent -BinaryPathName '"<path>\massar-agent.exe" --service' `
     -DisplayName "Massar Remote-Console Agent" -StartupType Automatic
   ```

   The `--service` argument matters: without it, the binary runs as an ordinary console program that never talks to the Service Control Manager, and the start fails with error 1053.
8. **Store the environment.** `MASSAR_BROKER_URL`, `MASSAR_AGENT_TOKEN`, `MASSAR_DEVICE_ID`, and `RUST_LOG=info` are written as a multi-string value under the service's own registry key, `HKLM:\SYSTEM\CurrentControlSet\Services\massar-agent\Environment` - per-service configuration, not a global machine environment variable that every process would inherit.
9. **Set restart-on-failure.**

   ```powershell
   sc.exe failure massar-agent reset= 86400 actions= restart/5000/restart/5000/restart/5000
   ```

   Three retries, five seconds apart - the same resilience model as the systemd unit's `Restart=always`.
10. **Register in Settings > Apps.** Writes `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\massar-agent` with `DisplayName "Cogitave Massar"`, the publisher (`Cogitave`), the install location, a display icon, and an `UninstallString` that points at a copy of `uninstall.ps1` the installer stages inside the install directory.
11. **Start the service** and confirm `Get-Service massar-agent` reports `Running` before declaring success. If it doesn't, the installer dies pointing at the Windows event log rather than leaving you guessing.

> [!NOTE]
> The installer writes the Settings entry so Massar is removable where people already look. The script's own comment: "Massar must be removable where people already look for it. Without this key it would not appear in Settings/Control Panel at all, and the only way out would be running a script by hand." It copies `uninstall.ps1` next to the binary on a best-effort basis (`-ErrorAction SilentlyContinue`) and points the `UninstallString` at that copy, so keep `uninstall.ps1` beside `install.ps1` when you run it.

## Details worth knowing about step 10

The Settings > Apps entry is populated from what the installer can learn at install time:

- **Version.** The installer runs the just-copied `massar-agent.exe --version`, which prints `massar-agent <semver>`, and stores that first line of output as `DisplayVersion`. The probe is wrapped in `try/catch`: if it fails, `DisplayVersion` is left empty, and the registry loop simply skips empty values rather than writing a blank field.
- **A registry write must never fail the install.** Reading the version is the only such probe, and it cannot abort a machine setup that has otherwise succeeded - the worst case is one missing field in the Apps entry.

## Local dev testing

`-BinaryPath` plus `-SkipSignatureCheck` is the combination for testing a binary you built yourself, cross-compiled or otherwise, before any release - or for pointing at the loopback broker from the next unit instead of a real Diyar deployment. `-SkipSignatureCheck` prints a warning every time it's used; it is not meant to be part of a normal install.

## Confirm it's running

```powershell
Get-Service massar-agent
```

The `Status` column should read `Running`. You'll also find the agent listed as **Cogitave Massar** under **Settings > Apps > Installed apps**, with the publisher shown as Cogitave and, if the installed binary answered `--version`, a version string next to it - that's also where you'll go to remove it later.
