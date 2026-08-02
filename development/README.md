# Wikibase Suite development

This directory contains the image sources and the build, integration-test, and release tooling for Wikibase Suite. It is not required to install or operate Wikibase Suite with the published images.

## Contents

- [`images/`](./images): Dockerfiles and supporting source for the published Wikibase Suite images
- [`test/`](./test): integration test runner, suites, and specifications
- [`scripts/`](./scripts): the `wbs-dev` CLI and its shared build, test, lint, and source-update commands
- [`container/`](./container): the Dockerized `wbs-dev` environment
- [`docs/`](./docs): engineering notes and architecture decisions

The user-facing product configuration and documentation live at the [repository root](../README.md). Canonical image usage documentation is in the [WBS Images Guide](../docs/images/README.md).

## Repository and documentation map

This repository contains the installable product configuration, its documentation, the image sources, and the build, test, and release tooling.

Use the documentation according to the task:

| Task | Start here |
| --- | --- |
| Install or operate a published WBS release | [WBS documentation](../README.md) |
| Change product configuration or image sources | [Contributor guide](./CONTRIBUTING.md) |
| Run build, test, lint, update, or publish commands | [`wbs-dev` command guide](./docs/wbs-dev.md) |
| Add or debug an integration test | [Integration test suites](./test/README.md) |
| Change the installer or operations tools | [Tools development guide](../tools/docs/README.md) |
| Prepare and publish a release | [Release process](./docs/releasing.md) |
| Understand an architectural decision | [Architecture Decision Records](./docs/adr/index.md) |

The main development flow is: change the root Compose product or an image under
`images/`, build it through `./wbs-dev`, exercise it through the integration suites,
and publish approved versions through the repository workflows.

## Build and test

The `wbs-dev` wrapper resolves its own location, so it can be invoked from any
working directory. From the repository root:

```sh
development/wbs-dev build
development/wbs-dev test
development/wbs-dev lint
```

When already in `development/`, use the equivalent `./wbs-dev ...` form. For
target selection, forwarded options, and all commands, see the
[`wbs-dev` command guide](./docs/wbs-dev.md). For contributor setup, see
[CONTRIBUTING.md](./CONTRIBUTING.md).
