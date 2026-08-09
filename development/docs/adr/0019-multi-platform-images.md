# 19) Publish multi-platform images {#adr_0019}

Date: 2026-08-03

## Status

Accepted

## Context

Wikibase Suite currently publishes and tests AMD64 images. We want to publish combined AMD64/ARM64 image manifests once every distributed image is verified on both architectures.

The current tooling is partially prepared:

- `wbs-dev build` accepts Buildx platform selection, including a comma-separated multi-platform set for registry builds. A multi-platform local load is rejected because the Docker image store cannot load it as one image.
- Registry caches are scoped by the requested platform set.
- The shared CI setup action can opt into QEMU without adding emulation overhead to normal AMD64 jobs.
- The AMD64-only Wikimedia Composer images used by Wikibase and QuickStatements run as AMD64 intermediate stages and copy portable PHP dependencies into the target image.

## Decision

Publish `linux/amd64` and `linux/arm64` variants through the shared `wbs-dev` build path. GitHub Actions supplies native `ubuntu-24.04` and `ubuntu-24.04-arm` runners, credentials, and requested platforms rather than implementing a separate image build path or emulating the complete ARM64 build with QEMU. The ARM64 runner enables limited AMD64 emulation for the two AMD64-only Composer intermediate stages; final-image stages execute natively.

Each architecture is built independently. Create Release tests architecture-specific tags once before creating image release tags. The image-tag workflows then build their selected image by digest, and Buildx assembles the public tags from the successful digests. Release tags remain defined by each image's Bake manifest.

Pull requests and pushes to `main` build and test AMD64 only. Release workflows repeat the complete matrix on native ARM64 runners before publishing a multi-platform image, covering every distributed image through its integration suites. The manually dispatched Build and Test workflow can also enable ARM64 builds and tests for a one-off confidence run.

The repository variable `WBS_RELEASE_ARM64` is the release switch. When it is `true`, releases build, test, and publish both architectures. Any other value publishes AMD64 only while retaining the native ARM64 capability in the reusable and manual workflows. This provides an operational rollback without reverting the implementation.

## Consequences

Native runners avoid the severe emulation cost observed in the compatibility experiment, particularly for Wikibase, WDQS frontend, and QuickStatements. The extra architecture consumes additional parallel runner capacity and maintains a separate platform-scoped BuildKit cache.

Local single-platform builds remain the default. QEMU remains available as a diagnostic fallback, but it is not the normal release path.
