Shaping a good v1 is half the job. The
[versioning-and-deprecation standard](../../../../standards/docs/standards/api-versioning-and-deprecation.md)
owns the other half: changing that contract over time without breaking anyone.
Its governing doctrine is blunt - **never break userspace without consent.** A
public contract stays functional until it has been deprecated, sunset, and
retired through process. There is no silent break.

## 1. The right scheme per surface

There is no single versioning scheme that fits a library, a wire protocol, and a
graph. An AI-native org picks per surface and makes the version **observable** so agents
can negotiate it:

| Surface | Scheme | Default |
|---|---|---|
| Library / SDK | **SemVer 2.0.0** | machine-verified before publish |
| HTTP API (public) | **date-based, consumer-pinned** (`YYYY-MM-DD`) | no hard cutover |
| gRPC / Protobuf | **field-number immutability** | additive-only |
| GraphQL | **continuous evolution**, `@deprecated` | never versioned |
| Event / JSON schema | **registry compatibility mode** | `BACKWARD_TRANSITIVE` |
| MCP | **protocol date + per-capability SemVer** | negotiated |

Two choices are worth internalizing. **HTTP is date-based and consumer-pinned**:
a consumer sends `Cogitave-Version: 2026-06-28`, the server serves that frozen
contract and transforms responses forward, so each integration upgrades
deliberately by bumping one date instead of being force-migrated. A version is
not a URL - it belongs in a header, not in `/v2`. **gRPC rests on one absolute
rule: a field number is forever.** Never change, reuse, or retype a field number;
`reserved` a number and its name on removal. Both are gated in CI (`buf breaking`
for proto, the manifest and RFC for HTTP).

## 2. Additive by default, and the support window

Backward compatibility within a contract is **absolute** - additive change only.
Any subtractive or semantics-altering change starts a new contract version and
deprecates the old one. Cogitave's policy, for instance, supports the current contract plus the previous
(N-1) for a **minimum of 12 months**, and date-pinned HTTP consumers for
**24 months** from the date they pin. The exact window is declared in the
deprecating RFC and encoded in the manifest - never implicit.

## 3. The deprecation lifecycle

A contract moves through a fixed state machine, aligned to the docs moniker so
the API and its documentation always agree:

`preview -> active -> deprecated -> sunset -> retired`

`deprecated` still serves and emits signals; `sunset` is the phase after
`sunsetAt` when removal is imminent; `retired` returns a typed error with a
migration link. Announcing `deprecated` to `sunsetAt` is a **minimum 6 months**;
the total deprecated window is **at least 12 months**. Removal is gated by
**both** the calendar (`sunsetAt` passed) **and** observation - you may not retire
a contract you cannot prove is unused, measured by a deprecation-usage metric.

## 4. One manifest, no drift

A deprecated contract MUST emit **every** applicable signal: HTTP `Deprecation`
and `Sunset` headers, in-schema markers (`@deprecated`, proto `deprecated = true`,
OpenAPI `deprecated: true`), SDK/CLI warnings, a changelog `Deprecated` entry, and
a migration guide. All of them are **generated from one committed
[deprecation manifest](../../../../standards/docs/standards/api-versioning-and-deprecation.md)**,
updated in the same PR as the change, so headers, docs moniker, and changelog
cannot disagree.

> [!IMPORTANT]
> A breaking or deprecating change is a **design-class change**. It requires an
> Accepted RFC through the request lifecycle before any code. Agents draft the
> RFC, manifest, and migration guide and open the PR; a human holds the merge and
> retirement gate - agents propose, they never enact.
