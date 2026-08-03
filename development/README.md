# Wikibase Suite development

This development area contains the image sources and the build, integration-test, and release tooling for Wikibase Suite. It is for contributors and advanced users building customized images; it is not required to install or operate WBS with the published images.

The installable product configuration and user documentation live at the [repository root](../README.md).

## Getting started

Development requires Git and a current Docker installation with the Compose and Buildx plugins. Node.js, pnpm, Python, and the repository linters do not need to be installed on the host.

Run repository tasks through `wbs-dev`. From the repository root:

```bash
development/wbs-dev build
development/wbs-dev test
development/wbs-dev lint
```

Test commands build the local images before running. Docker's layer cache keeps unchanged builds inexpensive. When already in `development/`, use the equivalent `./wbs-dev ...` form.

See the [local development guide](./docs/local-development.md) for environment details and common workflows, or the [`wbs-dev` command guide](./docs/wbs-dev.md) for targets and options. Contribution expectations are in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Documentation map

Use the documentation according to the task:

| Task | Start here |
| --- | --- |
| Install or operate a published WBS release | [WBS documentation](../README.md) |
| Set up and work in the repository locally | [Local development guide](./docs/local-development.md) |
| Prepare and submit a change | [Contributor guide](../CONTRIBUTING.md) |
| Run build, test, lint, update, or publish commands | [`wbs-dev` command guide](./docs/wbs-dev.md) |
| Add or debug an integration test | [Integration test suites](./test/README.md) |
| Change the installer or operations tools | [Tools development guide](../tools/docs/README.md) |
| Prepare and publish a release | [Release process](./docs/releasing.md) |
| Understand an architectural decision | [Architecture Decision Records](./docs/adr/index.md) |

## Repository layout

- [`images/`](./images): Dockerfiles and supporting source for the published Wikibase Suite images
- [`test/`](./test): integration test runner, suites, and specifications
- [`scripts/`](./scripts): internal implementation behind the `wbs-dev` commands
- [`container/`](./container): Dockerized `wbs-dev` environment
- [`docs/`](./docs): development guides, engineering notes, and architecture decisions

Canonical image usage documentation is in the [WBS Images Guide](../docs/images/README.md).
