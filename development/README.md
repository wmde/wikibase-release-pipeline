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

## Running a Suite instance

Use the repository-root `.env` and Compose configuration to run Wikibase Suite as an installed user would:

```bash
./wbs up --build
./wbs status
./wbs down
```

`wbs up --build` builds every WBS product image from the current checkout, selects the local-image Compose override, and starts the Suite without pulling published product images. Use `./wbs up --update` without the development option to update and start the configured published images.

When the repository-root `.env` is missing or incomplete, interactive `wbs up` resumes the command-line configurator. Existing values become prompt defaults and existing passwords can be retained without displaying them. An existing `.env` remains the configuration base; template values are used only when creating a new configuration. With `--build`, the configurator supplies local host, administrator, and database defaults for values that are still missing.

Optional repository-root `local.env` values override `.env` when lifecycle commands run Docker Compose. The configurator continues to own `.env` and never modifies `local.env`. The WBS host runner sources this trusted, shell-compatible file before preparing the runtime and tools image. For example, developers building every image locally on ARM can set `WBS_SKIP_ARCH_CHECK=true` without changing the supported installer defaults.

The `development/wbs` lifecycle commands are an internal, experimental development interface. They are intentionally absent from the repository root and are not documented as an end-user operations feature yet.

The current local profile uses `wikibase.test` and `query.wikibase.test`. The configurator prints the hosts-file entry needed when those names do not already resolve locally. Local DNS and certificate handling remain separate from image and lifecycle selection.

Compose files are applied in this order: the root `docker-compose.yml`, the development local-image override when selected, and the optional root `docker-compose.local.yml` last. This allows checkout-specific customizations to override either image mode.

To remove all Suite volumes and generated configuration, use `./wbs reset`. This asks for confirmation, permanently deletes the instance data, and leaves the Suite stopped; run `./wbs up` explicitly when you want to start it again. Use `--force` only for automation. The deleted state is described in the user-facing [reset documentation](../docs/operating/reset.md).

For exploratory work inside an integration-test environment instead, start exactly one named suite with `--setup`:

```bash
./wbs-dev test repo --setup
```

This builds the test images, starts that suite's test-only services and fixtures, and leaves the environment running without executing its specifications. It is test infrastructure rather than an alternative product lifecycle command.

## Developing the browser installer

Start the browser installer with live reload from the current checkout:

```bash
./wbs-dev installer-dev web
```

This builds the local Suite images, uses local test domains, and runs the normal host launch scripts, so following the regular installer actions performs a real Suite installation.

For UI and UX work without starting services, use mock mode:

```bash
./wbs-dev installer-dev web --mock
```

Mock mode builds only the installer tools image, makes the progress steps clickable, and runs normal form validation. Starting installation emits an accelerated, realistic installation log through the completed screen, but does not write the repository `.env`, signal the host launch scripts, or start Suite services. Without `--mock`, the progress steps are not skippable and the installer retains its real end-to-end behavior.

Use `./wbs-dev --help` or `./wbs-dev <command> --help` for the current targets, options, and examples.

Contribution expectations are in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Local configuration

Put optional local overrides in `development/local.env`. The `wbs-dev` wrapper creates the file when it is missing. Test defaults come from the root `.env.example`, `development/tests/test-services.env`, and `development/tests/test-runner.env`.

If parallel browser-test workers exhaust local CPU or memory, set `WBS_TEST_MAX_INSTANCES=1` in `development/local.env`. This caps every suite without changing its CI defaults.

See the [integration test guide](./tests/README.md#environment-and-local-overrides) for test-specific variables.

## Documentation map

Use the documentation according to the task:

| Task | Start here |
| --- | --- |
| Install or operate a published WBS release | [WBS documentation](../README.md) |
| Set up and work in the repository locally | This guide |
| Prepare and submit a change | [Contributor guide](../CONTRIBUTING.md) |
| Run build, test, lint, update, or publish commands | `./wbs-dev <command> --help` |
| Add or debug an integration test | [Integration test suites](./tests/README.md) |
| Develop or test the installer and operations tools | [WBS tools development guide](./images/wbs-tools/docs/README.md) |
| Prepare and publish a release | [Release process](./docs/releasing.md) |
| Understand an architectural decision | [Architecture Decision Records](./docs/adr/index.md) |

## Repository layout

- [`images/`](./images): Dockerfiles and supporting source for the published Wikibase Suite images
- [`tests/`](./tests): integration test runner, suites, and specifications
- [`tooling/`](./tooling): internal implementation behind the `wbs-dev` commands
- [`docs/`](./docs): development guides, engineering notes, and architecture decisions
- [`Dockerfile`](./Dockerfile), [`docker-compose.yml`](./docker-compose.yml), and [`wbs-dev`](./wbs-dev): containerized development environment and its supported entry point
- [`wbs`](./wbs): experimental developer entry point for emerging Suite lifecycle commands
- [`docker-compose.local-images.yml`](./docker-compose.local-images.yml): product override selecting images built from the current checkout

Canonical image usage documentation is in the [WBS Images Guide](../docs/images/README.md).
