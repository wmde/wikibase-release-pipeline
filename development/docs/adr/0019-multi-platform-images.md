# 19) Support multi-platform image builds (AMD64 and ARM64) {#adr_0019}

Date: 2026-08-03

## Status

Accepted

## Context

Wikibase Suite has historically published and tested AMD64 images. We want the option to publish combined AMD64/ARM64 image manifests after every distributed image and integration suite has been verified on both architectures.

## Decision

Multi-platform release support is fully implemented through the shared `wbs-dev` build and test paths. GitHub Actions uses native `ubuntu-24.04` and `ubuntu-24.04-arm` runners rather than implementing a separate image path or emulating complete ARM64 builds. Limited AMD64 emulation remains necessary for AMD64-only Composer intermediate stages; final-image stages execute natively.

Each architecture is built independently. Create Release tests architecture-specific tags once before creating image release tags. The image-tag workflows then build their selected image by digest, and Buildx assembles the public tags from the successful digests. Release tags remain defined by each image's Bake manifest.

Pull requests and pushes to `main` build and test AMD64 only. When enabled for a release, CI performs the full build and test cycle, including every test suite, for both AMD64 and ARM64 before publication. This increases a typical Build and Test run from approximately 6–7 minutes to 10–12 minutes. Most of the added time comes from the Wikibase image's AMD64-only PHP Composer build dependency running under emulation on the ARM64 runner. The manually dispatched Build and Test workflow can also enable ARM64 builds and tests for a one-off confidence run.

The capability is available, but publishing multi-platform product releases has not yet been approved. Releases therefore remain AMD64-only unless the Actions repository variable `WBS_RELEASE_ARM64` is set to `true` under **Repository settings → Secrets and variables → Actions → Variables**. Any other value keeps AMD64-only publication while retaining the native ARM64 capability in the reusable and manual workflows.

## Consequences

Native runners avoid emulating complete builds, but the extra architecture still consumes additional parallel runner capacity, maintains a separate platform-scoped BuildKit cache, and lengthens the complete release gate.

Local single-platform builds remain the default. QEMU remains available as a diagnostic fallback, but it is not the normal release path.
