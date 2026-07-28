You can now install, verify, and cleanly remove the Cogitave Massar agent on
Linux or Windows, and reproduce an entire session locally without a Diyar
deployment.

In this module, you:

- Gathered what an install needs - a broker URL and a per-device token - and
  confirmed Massar's supported platforms today: Linux and Windows only; macOS
  is deferred, with no installer or service definition, even though CI
  cross-compiles a macOS binary on every release.
- Learned how the installer verifies a release before it ever touches disk:
  an unconditional SHA-256 checksum, then a signature check (keyless cosign on
  Linux, Authenticode on Windows), with a CycloneDX SBOM and SLSA provenance
  attached for audit rather than as an install-time gate.
- Installed the agent as a systemd service on Linux (`install.sh`) or a
  Windows service on Windows (`install.ps1`) - each locked down to exactly the
  authority it needs - and confirmed each was actually running.
- Traced a session's wire protocol from `open` through `resize` to `close`,
  and reproduced the full agent-broker-operator relay locally with
  `massar-broker-dev` and `massar-op-test`, watching the `MASSAR_PROOF_OK`
  sentinel round-trip through a real PTY.
- Removed the agent cleanly on either OS with `uninstall.sh` or
  `uninstall.ps1`, and learned exactly what removal erases locally (the
  binary, the config, the token) versus what it can never touch: Diyar's own
  record of every session that ran while the agent was active.

That completes the two modules of the "Get started with Cogitave Massar"
path: understanding the guardian agent's security model, and now installing,
proving, and removing it yourself.

## Next steps

- @cogitave.learn.paths.get-started-with-massar - return to the path to claim
  your trophy.
