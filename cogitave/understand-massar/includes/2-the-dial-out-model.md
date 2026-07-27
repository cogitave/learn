The security posture that makes Massar acceptable to install on a customer device starts with one architectural choice: the agent only ever calls out. This unit explains that choice and why it matters.

## The alternative Massar avoids

Classic remote-access tooling asks a device to accept connections: an SSH server listening on a port, or a VPN client joining the device to a private network so an operator's tooling can reach it directly. Both require the device, or its network, to expose something inbound, and both put ongoing firewall or network configuration on the customer's side of the relationship.

## The dial-out model

Massar's agent makes exactly one kind of network connection: an outbound WebSocket to the Diyar console broker. It never listens on a local socket, and the operator never connects to the device directly - the operator reaches the device *through* Diyar, from a browser.

> [!NOTE]
> This is the same posture as AWS Systems Manager (SSM) and Azure Arc: the managed device calls the cloud control plane, never the other way around.

## Why it needs no inbound port and no VPN

Because the agent's only network activity is an outbound connection to a broker address it is configured with:

- **No inbound port to open.** Most site firewalls default to allow-outbound / deny-inbound; dial-out fits that default instead of requiring an exception to be carved out.
- **No VPN client to install, join, or maintain.** The device does not need to be placed on a private network segment reachable by operator tooling.
- **No dependency on the device's network position.** It can sit behind NAT, on a residential connection, or in a locked-down subnet - anywhere with outbound HTTPS/WSS egress is enough.

## What the agent needs on the device - and nothing else

Least privilege at the network layer would not mean much if the process itself ran wide open, so the service is also locked down to only what dial-out and a PTY session require. On Linux, the systemd unit runs the agent with:

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
```

`DynamicUser`, `NoNewPrivileges`, and `ProtectSystem=strict` mean the service runs as an unprivileged, ephemeral user with a locked-down view of the system - it has an outbound socket and, when a session is open, a PTY. Nothing more is granted at the OS level.

## A new kind of artifact for Cogitave

Massar is the first product in the Cogitave estate to ship an installed, on-device binary running as a long-lived OS service. Cogitave's other agent products - `yuva` and `namzu` - deliberately ship no installer or service of this kind (`yuva` is a direct-kernel-boot guest; `namzu` runs sandboxed tools with no daemon). That means the supply-chain requirements around Massar's binary - signed, checksummed, SBOM'd artifacts - matter in a way they have not for anything else Cogitave ships yet; Unit 4 covers what is verified before that binary is placed on a device.

## What you should take away

The dial-out model is not just a convenience for getting through firewalls - it is the reason a device that has never opened a port to anyone can still be reached for an authorized, audited session. Unit 3 covers what happens on that one outbound connection once it is open.
