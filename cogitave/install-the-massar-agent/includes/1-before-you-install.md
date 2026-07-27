Before you run an installer, you need three things ready: a supported OS, a broker URL, and a per-device token. This unit covers what each one is, what actually ships in a release, and how Massar verifies the binary before it ever touches disk.

> [!NOTE]
> Installing the agent grants Cogitave operators audited remote-console access to this device, once an authorized operator opens a session through Diyar. Both installers state this consent plainly before they finish running - do not install unless you intend to authorize that access.

## Supported platforms today

| Platform | Installer | Service model | Status |
| --- | --- | --- | --- |
| Linux | `install/install.sh` | systemd unit | Shipped |
| Windows | `install/install.ps1` | Windows service | Shipped |
| macOS | - | launchd (not written) | Deferred |

Linux and Windows are the two install targets that actually end in a running, self-restarting OS service. macOS is deferred, and ADR-0002 says so plainly: "macOS (launchd) is deferred until there is a customer for it." There is no `install/launchd/` unit, and `install.sh`'s own service-installation step only knows how to write a systemd unit - running the script on a Mac clears the OS-detection check and then fails the moment it reaches `systemctl daemon-reload`, which doesn't exist there.

CI does cross-compile `massar-agent` for `x86_64-apple-darwin` and `aarch64-apple-darwin` on every release, alongside the Linux and Windows targets, so a macOS **binary** exists in every GitHub Release. That is not the same as macOS being a supported **install path** - there is no installer or service definition to put that binary into.

Both supported platforms build for two architectures: `x86_64` and `aarch64` on Linux, `x86_64` on Windows.

## What a release actually contains

Every tagged release carries, per architecture, the binary plus its supply-chain sidecars:

```text
massar-agent-linux-x86_64          massar-agent-linux-x86_64.sha256
massar-agent-linux-x86_64.cdx.json massar-agent-linux-x86_64.sig / .pem
massar-agent-linux-aarch64         ...same set...
massar-agent-windows-x86_64.exe    ...same set (the .exe is also cosign-signed,
                                   because it is built on the Linux runner;
                                   Authenticode is an additional layer, pending an EV cert)...
```

Each artifact is also covered by a SLSA build-provenance attestation (`actions/attest-build-provenance`). The installer scripts themselves are run from the repository - the release job attaches the per-architecture binary and its supply-chain sidecars, and nothing else, so treat `install/install.sh` and `install/install.ps1` in the repo as the installers.

## What you need before you start

Both installers need the same two facts about your Diyar-connected account:

- **A broker URL** - the WebSocket address of the Diyar console broker this device will dial out to, for example `wss://diyar.cogitave.com/api/v1/console/agent`. The agent only ever makes an outbound connection to this address; it opens no inbound port and needs no VPN.
- **A per-device token** - the secret issued at enrollment for this specific device. The agent sends it as an `Authorization: Bearer` header when it dials the broker, and the broker derives the device's identity from it - the token *is* the credential, not just a lookup key.

> [!IMPORTANT]
> Enrollment today is a pre-issued static token you obtain out of band and hand to the installer with `--token` / `-Token`. A guided graphical setup wizard and a device-code/QR pairing flow exist as designs in Massar's frontend, but the backend commands behind them are not implemented - the CLI installer with a static token is the path that actually enrolls a device today.

Both installers also accept a device identifier (`--device-id` / `-DeviceId`), which defaults to the machine's hostname (`$(hostname)` on Linux, `$env:COMPUTERNAME` on Windows). It is used for logging only; the broker derives the device's real identity from the token, so the device id plays no part in authentication.

## How the binary is verified before it's placed

Every release build goes through the same chain before the installer will write it to disk:

1. **SHA-256 checksum** - checked unconditionally, on both platforms, whether or not anything else below runs. `install.sh` downloads the `.sha256` sidecar next to the binary and refuses to continue on a mismatch; `install.ps1` does the equivalent with `Get-FileHash -Algorithm SHA256`.
2. **Signature.** On Linux, a **keyless cosign** signature:

   ```bash
   cosign verify-blob \
     --certificate-identity-regexp 'https://github.com/cogitave-cloud/.+' \
     --certificate-oidc-issuer https://token.actions.githubusercontent.com \
     --signature "${asset}.sig" --certificate "${asset}.pem" "${asset}"
   ```

   That checks the artifact was signed by CI's own GitHub Actions OIDC identity - no long-lived signing key sits anywhere. On Windows, the equivalent check is **Authenticode**: `Get-AuthenticodeSignature` must report `Valid`.
3. **SBOM + provenance.** A CycloneDX SBOM and a SLSA build-provenance attestation (`actions/attest-build-provenance`) are produced and attached to the release for every artifact, so the binary's build inputs and dependency graph stay inspectable after the fact. Neither installer fetches these at install time - they exist for audit, not as an install-time gate.

Both installers have a development escape hatch - `--skip-signature` on Linux, `-SkipSignatureCheck` on Windows - for locally built, unsigned binaries. Both print a loud warning when used, and neither one skips the checksum: that check has no off switch on either platform.

> [!WARNING]
> Windows Authenticode signing needs an EV code-signing certificate, and ADR-0002 records that one is not provisioned yet: "until an EV cert is provisioned, `install.ps1 -SkipSignatureCheck` exists for dev/test only ... This is the one open supply-chain gap, tracked for cutover." Until that cutover, the release pipeline warns and ships an unsigned Windows binary rather than silently skipping the step - check the release notes for the current state before you rely on `install.ps1` without `-SkipSignatureCheck`.

## Before you move on

Have these ready, whichever OS you're installing on:

- [ ] A Linux machine with systemd, or a Windows machine - not a Mac.
- [ ] Root (Linux) or an Administrator shell (Windows). Both installers refuse to run without it, because registering a service requires it.
- [ ] The broker URL for your Diyar-connected environment.
- [ ] The per-device token issued at enrollment for *this* device - tokens are per-device, not shared across a fleet.
- [ ] `cosign` installed if you want the Linux installer to check the signature, not just the checksum. It's optional: without it, `install.sh` warns and continues on the verified checksum alone, rather than failing.

Next: install on Linux, or install on Windows, whichever matches the device in front of you.
