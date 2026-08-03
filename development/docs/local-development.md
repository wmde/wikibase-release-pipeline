# Local development

This guide covers the local environment and common development workflows. Run the examples from the repository root unless stated otherwise.

## Requirements

Local development requires Git and a current Docker installation with the Compose and Buildx plugins. Node.js, pnpm, Python, and the repository linters do not need to be installed on the host.

Repository tasks run through [`development/wbs-dev`](./wbs-dev.md). The wrapper builds or loads the `wbs-dev` image and runs the TypeScript task coordinator in that container. The checkout is mounted into the container, while image builds and test services use the host Docker daemon. GitHub Actions uses the same entry point and underlying scripts.

The wrapper is location-independent. From `development/`, `./wbs-dev <command>` is equivalent to `development/wbs-dev <command>` from the repository root.

## Local configuration

Put optional local overrides in `development/local.env`. The `wbs-dev` wrapper creates the file when it is missing. Test defaults come from the root `.env.example`, `development/test/test-services.env`, and `development/test/test-runner.env`.

See the [integration test guide](../test/README.md#environment-and-local-overrides) for test-specific variables.

## Build and test

Use `wbs-dev` for the normal development loop:

```bash
development/wbs-dev build wikibase
development/wbs-dev test repo
development/wbs-dev lint wikibase
```

Test commands build all local images once before running the selected suites. Docker's layer cache keeps unchanged builds inexpensive. CI builds images in parallel, imports and exports platform-specific cache records in GHCR, and runs the same suites with `--skip-build` against workflow-specific image tags.

See the [`wbs-dev` command guide](./wbs-dev.md) for target and option details and the [integration test guide](../test/README.md) for suite coverage and test authoring.

## Run the product configuration

To exercise the checked-out Docker Compose configuration directly, build the local images and start the deployment from the repository root:

```bash
development/wbs-dev build
docker compose up --wait
```

Use the [Wikibase Suite documentation](../../README.md) when installing or operating a published release.

## Develop the installer UI

Before running the development installer, configure your system's local hosts file so `wikibase.test` and `query.wikibase.test` resolve to the local machine. The installed services use `https://wikibase.test` and `https://query.wikibase.test`.

From the repository root, run:

```bash
./wbs install --dev
```

This builds WBS tools from the current `development/images/wbs-tools` source and starts the browser installer with live reload at `https://localhost:8888`. It assumes Git and Docker are installed and does not build the product images.

To test a complete installation from the current checkout rather than develop the installer UI, run:

```bash
./install --build
```

The source build uses normal installer networking unless `--local` is also supplied. It generates `docker-compose.build.yml` so subsequent Compose operations keep using the locally built images. Remove that file to return to published image tags.

## Rebuild without cache

The first `wbs-dev` command may take longer while the tooling image and workspace dependencies are prepared. Subsequent commands use Docker's local BuildKit cache.

To rebuild the tooling image without cached layers and refresh its base image:

```bash
WBS_DEV_NO_CACHE=true development/wbs-dev lint
```

To also rebuild a product image from fresh base images:

```bash
WBS_DEV_NO_CACHE=true development/wbs-dev build wikibase --no-cache --pull
```
