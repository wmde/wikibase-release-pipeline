# Wikibase Suite development

This development area contains the image sources and the build, integration-test, and release tooling for Wikibase Suite. It is for contributors and advanced users building customized images; it is not required to install or operate WBS with the published images.

The installable product configuration and user documentation live at the [repository root](../README.md).

## Getting started

Development requires Git and a current Docker installation with the Compose and Buildx plugins. Node.js, pnpm, Python, and the repository linters do not need to be installed on the host.

Repository tasks run through `wbs-dev`. The wrapper builds or loads the development-tooling image and runs the TypeScript task coordinator in that container. The checkout is mounted into the container, while image builds and test services use the host Docker daemon. GitHub Actions uses the same entry point and underlying scripts.

> [!NOTE]
> Development commands in this documentation assume you first run `cd development`; examples therefore use `./wbs-dev` consistently. Optionally, add the repository's `development/` directory to your shell's `PATH` to run the wrapper as `wbs-dev` from any working directory.

```bash
./wbs-dev build
./wbs-dev test
./wbs-dev lint
```

Use `./wbs-dev --help` or `./wbs-dev <command> --help` for the current targets, options, and examples.

Contribution expectations are in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Local configuration

Put optional local overrides in `development/local.env`. The `wbs-dev` wrapper creates the file when it is missing. Test defaults come from the root `.env.example`, `development/tests/test-services.env`, and `development/tests/test-runner.env`.

See the [integration test guide](./test/README.md#environment-and-local-overrides) for test-specific variables.

## Documentation map

Use the documentation according to the task:

| Task | Start here |
| --- | --- |
| Install or operate a published WBS release | [WBS documentation](../README.md) |
| Set up and work in the repository locally | This guide |
| Prepare and submit a change | [Contributor guide](../CONTRIBUTING.md) |
| Run build, test, lint, update, or publish commands | `./wbs-dev <command> --help` |
| Add or debug an integration test | [Integration test suites](./test/README.md) |
| Develop or test the installer and operations tools | [Tools development guide](../tools/docs/README.md) |
| Prepare and publish a release | [Release process](./docs/releasing.md) |
| Understand an architectural decision | [Architecture Decision Records](./docs/adr/index.md) |

## Repository layout

- [`images/`](./images): Dockerfiles and supporting source for the published Wikibase Suite images
- [`test/`](./test): integration test runner, suites, and specifications
- [`tooling/`](./tooling): internal implementation behind the `wbs-dev` commands
- [`container/`](./container): Dockerized `wbs-dev` environment
- [`docs/`](./docs): development guides, engineering notes, and architecture decisions

Canonical image usage documentation is in the [WBS Images Guide](../docs/images/README.md).
