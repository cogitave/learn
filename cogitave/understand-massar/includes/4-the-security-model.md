Two separate authorization boundaries protect a Massar session: the device proves who it is with a token, and the operator is authorized and audited on the Diyar side. This unit covers both, plus exactly what is shipped today versus designed for later.

## How the device authenticates

Every device is issued a per-device secret at enrollment. The installer takes it as a required flag, and the agent sends it as a bearer token on every connection to the broker:

```bash
sudo ./install/install.sh --broker-url wss://diyar.cogitave.com/api/v1/console/agent --token <device-secret>
```

```powershell
.\install\install.ps1 -BrokerUrl wss://diyar.cogitave.com/api/v1/console/agent -Token <device-secret>
```

The agent stores this alongside its broker URL and device ID in an environment file it reads at startup, and sends it as an `Authorization: Bearer` header when it dials the broker - the cloud side derives the device's identity from that token; the agent does not identify itself to the broker any other way.

```bash
# /etc/massar/agent.env, written by install.sh, chmod 0600:
MASSAR_BROKER_URL=wss://diyar.cogitave.com/api/v1/console/agent
MASSAR_AGENT_TOKEN=<device-secret>
MASSAR_DEVICE_ID=<hostname>
```

> [!NOTE]
> **This static, pre-issued token is the enrollment path that ships today.** Massar's frontend also includes a graphical setup wizard and mocked UI for an RFC 8628 device-code / QR-code enrollment flow - the kind where you would approve a new device from an already-authenticated console instead of copying a secret to it. That flow is a preview of where enrollment is headed: the UI exists, but the backend commands behind it are not implemented. If you are enrolling a device today, the token flag above is the real path.

## How the operator is authorized

Massar itself does not decide who may open a session against a device - that authority sits entirely on the Diyar side. The operator side of a session is gated by Diyar's role-based access control (an operator needs operator rank on the device's workspace), and every session that is opened is recorded there. Massar's own job stops at the wire and the PTY; it holds no user directory and makes no authorization decision of its own.

## No standing shell

Massar never keeps a shell running "just in case." A PTY is created only in response to an explicit `open` control frame sent through the broker, and it is torn down the moment the session's WebSocket connection ends - deliberately closed by the operator, dropped by the broker, or lost to the network. There is no idle session sitting between uses, and no persistent shell to find if something on the device is compromised independent of an active console session.

Sessions are also TTL-bounded on top of that: they exist for as long as an explicitly opened session is active, not indefinitely.

## Consent, stated at install time

Installing Massar is a deliberate grant of access, and both installers say so before anything is configured:

> "Consent: installing this grants Cogitave operators the ability to open a remote console (terminal) to this device, gated by Diyar RBAC and fully audited. Do not install unless you authorize that access."

The Linux installer prints the same point again after the service starts, so the person running it sees the consequence twice - once as a warning, once as a confirmation of what just happened:

```text
Massar agent installed and running.
This device is now connected to Diyar. An authorized operator can open a web terminal to it (role-gated and fully audited).
To remove it: sudo ./uninstall.sh
```

## What is verified before the binary is trusted

The token and the RBAC/audit boundary protect a *running* agent; supply-chain controls protect the binary itself before it is installed. Each release attaches a SHA-256 checksum, a CycloneDX SBOM, a keyless cosign signature (verified against the OIDC identity of Cogitave's GitHub Actions), and SLSA build provenance; Windows binaries are additionally Authenticode-signed. The installer verifies the checksum and signature before it places the binary - `--skip-signature` (Linux) and `-SkipSignatureCheck` (Windows) exist only for local development builds and are loudly labeled as such.

> [!WARNING]
> Windows Authenticode signing today runs without a provisioned EV certificate, so `-SkipSignatureCheck` is currently the only way to install a locally built test binary. This is a known, tracked gap - not a supported way to skip verification on a production device.

## Platforms this covers today

Massar installs on Windows and Linux only today. macOS is deliberately deferred - there is no installer path and no service definition for it, even though Cogitave's release pipeline cross-compiles a macOS binary as part of its build matrix. The Linux installer's own header flags this directly: it targets Linux first, with macOS (via launchd) explicitly "not yet." If your fleet includes macOS devices, there is no supported way to run Massar on them yet.
