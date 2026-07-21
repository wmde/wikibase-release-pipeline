# Wikibase Suite development

This directory contains the image sources and the build, integration-test, and release tooling for Wikibase Suite. It is not required to install or operate Wikibase Suite with the published images.

## Contents

- [`images/`](./images): Dockerfiles and supporting source for the published Wikibase Suite images
- [`test/`](./test): integration test runner, suites, and specifications
- [`tooling/`](./tooling): shared image build and source-update utilities
- [`runner/`](./runner): the Dockerized Nx development environment
- [`docs/`](./docs): engineering notes and architecture decisions

The user-facing product configuration and documentation live at the [repository root](../README.md). Canonical image usage documentation lives under [`docs/images`](../docs/images/README.md).

## Build and test

Run development commands from this directory. The `nx` wrapper runs them in the standard Docker development environment by default.

```sh
cd development
./nx build
./nx test
./nx lint
```

For contributor setup, command details, and the release process, see [CONTRIBUTING.md](./CONTRIBUTING.md).
