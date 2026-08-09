# Maintaining Wikibase Suite (WBS) Tools

[Back to the release guide](../../docs/release.md#prepare-a-release)

WBS Tools is currently published for the Installer. Its shared configuration and lifecycle implementation also provides the internal `wbs configure`, `install`, `up`, `down`, `status`, and `reset` commands. Treat those commands as an unpublished foundation for possible future operational workflows, not as a supported end-user interface. See [ADR 22](../../docs/adr/0022-wbs-tools-foundation.md).

## Develop and test

The source is divided by responsibility: `commands/` defines workflows, `cli/` contains terminal interaction, `web/` contains the Installer server and client, and `lib/` contains shared configuration and lifecycle behavior.

From `development/`, run the Installer with live reload or use mock mode for UI work that must not write configuration or start services:

```bash
wbs-dev installer-dev web
wbs-dev installer-dev web --mock
wbs-dev installer-dev web --mock failure
```

Run its integration suite:

```bash
wbs-dev test wbs-tools
```

To exercise a complete installation with locally built tools and product images, run `./install --from-source` from the repository root.

## Review and release

WBS Tools is repository-owned code and has no upstream source pins. `wbs-dev update wbs-tools` derives its version and changelog from conventional commits, then asks whether the current WBS release should adopt the proposed exact image. Declining leaves the WBS release on its existing tools image.

Review changes since the latest `wbs-tools@X.Y.Z` tag. Verify the Installer, generated configuration, the mounted WBS checkout, host scripts, Docker and Compose integration, Git operations, and the internal lifecycle commands.

### Version and image selection

The release inputs are:

| Input | Purpose | Release action |
| --- | --- | --- |
| `docker-bake.hcl` `IMAGE_VERSION` | Source of the image version, release tag, Docker tags, and changelog version. | Updated by `wbs-dev update wbs-tools`. |
| `.wbs/version` `WBS_TOOLS_IMAGE` | Exact tools image adopted by this WBS release. | Updated only when the WBS Tools update interview is accepted. |
| Bootstrap `WBS_TOOLS_IMAGE` default in the root `install` script | Selects the tools image before a WBS checkout exists. | Keep it aligned with `.wbs/version`; tooling tests enforce this bootstrap boundary. |
| Docker build argument `WBS_TOOLS_VERSION` | Records the exact tools version inside the image. | Derived automatically from `IMAGE_VERSION`; do not edit it manually. |
| Runtime override `WBS_TOOLS_IMAGE` | Selects a different image for development or verification. | Do not persist an override in a normal release. |

Publishing `X.Y.Z` also updates the mutable `X.Y` and `X` Docker tags. The OCI version label records the exact version inside the image, and released WBS checkouts select the exact `X.Y.Z` tag from `.wbs/version`.

A WBS command uses the exact `WBS_TOOLS_IMAGE` selected by its checkout. It immediately uses the image when it exists locally and pulls it only when missing. Updating to a WBS release that adopts a newer tools image therefore pulls that exact image on first use; publishing WBS Tools by itself does not change existing WBS releases.

### WBS compatibility contract

Compatibility is currently declared by adoption: each WBS checkout selects an exact WBS Tools image through `.wbs/version`. The WBS Tools package and image do not declare a supported WBS version or version range, and the OCI labels record only the tools version.

Before adopting a tools release, verify it with the WBS release that will select it, including its host scripts, configuration, and installation lifecycle. Publishing and adoption remain separate decisions so that tools development does not silently alter a released WBS product.

## Dependencies not updated automatically

`wbs-dev update` does not select the Node base image used by the [`Dockerfile`](./Dockerfile). When changing it:

- Keep build and runtime stages on the same supported Node major, aligned with the repository Node engine and type definitions.
- Confirm that Corepack installs the pinned pnpm version and production dependencies work on the selected Alpine release.
- Test the CLI, Installer server, Docker and Compose invocation, Git operations, and every published architecture.

[Continue with release preparation](../../docs/release.md#prepare-a-release)
