# `wbs-dev` command guide

`wbs-dev` is the supported entry point for repository development tasks. It replaces direct use of the underlying build, test, and lint scripts and is also the entry point used by GitHub Actions.

## Running the command

The wrapper resolves paths relative to its own location, so the current working directory does not matter. From the repository root, run:

```bash
development/wbs-dev <command>
```

From `development/`, the equivalent command is:

```bash
./wbs-dev <command>
```

Git and Docker with the Compose and Buildx plugins are required. Node.js, pnpm, Python, and the linters do not need to be installed on the host: `wbs-dev` runs them in the `wbs-build-tools` container.

Run `development/wbs-dev --help` or `development/wbs-dev <command> --help` for the current command-line reference.

## Selection and option rules

Targets follow the command directly. A `--` separator is not required. Once an option is encountered, it and the remaining arguments are forwarded to the underlying tool where applicable.

| Command | Default with no target | Explicit `all` | Forwarded options |
| --- | --- | --- | --- |
| `build` | all images | supported | Docker Buildx options |
| `test` | all suites, sequentially | supported | test runner and WebdriverIO options |
| `lint` | repository root | selects the root default | lint options |
| `update-commits` | all supported images | supported | none |
| `publish` | none; image names are required | not supported | Docker Buildx options |

Examples:

```bash
# One target
development/wbs-dev build wikibase

# Several targets
development/wbs-dev build wikibase wdqs

# A target followed directly by an underlying option
development/wbs-dev build wdqs --no-cache --pull
```

## Build

```bash
# Build every image (up to three concurrently by default)
development/wbs-dev build

# Build selected images
development/wbs-dev build wikibase wdqs

# Change coordinator concurrency
development/wbs-dev build --parallel=1
```

Local builds load `wikibase/<image>:latest` into the local Docker daemon. CI uses the same coordinator and build scripts, but adds a run-specific GHCR tag, pushes the result for test jobs, and uses shared BuildKit caches.

Test commands build all images once before running any selected suites. Local
Docker layer caching keeps unchanged builds inexpensive. Use `--skip-build` only
when the required images were already built by a separate step, as they are in
CI.

For a locally named custom build from a branch:

```bash
development/wbs-dev build wikibase \
  --tag example.registry/team/wikibase:my-branch
```

This loads the custom tag locally; pushing it to a registry remains a separate, explicit operation. The normal `publish` command is reserved for official versioned image tags.

## Test

```bash
# Every integration suite
development/wbs-dev test

# One suite
development/wbs-dev test repo

# Use images already built by a separate step
development/wbs-dev test repo --skip-build

# One spec in a suite's environment
development/wbs-dev test repo --spec suites/repo/specs/special-new-item.ts

# Start a suite environment and leave it running
development/wbs-dev test queryservice --setup
```

Available suites and their coverage are documented in the [test guide](../test/README.md). Local suites use the most recently built `wikibase/*:latest` images. CI points the same suites at images built and tagged for that workflow run.

## Develop the installer UI

The product-facing `wbs` command is separate from the repository task runner.
From any directory, invoke it through the path to the checkout:

```bash
/path/to/wikibase-suite/wbs install --dev
```

This builds `wbs-tools` from the current checkout, starts the browser installer
with live reload, uses local `.test` hostnames, and assumes Git and Docker are
already installed. It does not build the Wikibase Suite product images. Use
`development/wbs-dev build` separately when those images have changed.

## Lint

```bash
# Lint the repository root (the default)
development/wbs-dev lint

# Lint development tooling or tests
development/wbs-dev lint development
development/wbs-dev lint test

# Lint an image source directory
development/wbs-dev lint wikibase
```

The available targets are `root`, `development`, `test`, and every image name. Use `development/wbs-dev lint --help` for the current list.

## Update upstream commit pins

```bash
# Update every supported pin
development/wbs-dev update-commits

# Update selected pins
development/wbs-dev update-commits wikibase wdqs-frontend
```

The supported targets are `wikibase`, `wdqs-frontend`, and `quickstatements`. This command changes source pins only; review the diff and then build and test the affected images.

## Publish

`publish` builds and pushes the official Docker Hub tags derived from an image's committed `package.json` version. It requires one or more explicit image names:

```bash
# Inspect the Docker build and tags without pushing
development/wbs-dev publish wikibase --dry-run
```

Official publication normally happens in GitHub Actions after an image release tag is pushed. `publish` does not create Git tags, choose versions, or generate changelogs. See the [release guide](./releasing.md) for that workflow.

## Development environment details

The first command may take longer while the build-tools image and workspace dependencies are prepared. Later commands use Docker's local BuildKit cache. Optional local environment overrides belong in `development/local.env`, which the wrapper creates when missing.

To rebuild the tooling container without cache and refresh its base image:

```bash
WBS_BUILD_TOOLS_NO_CACHE=true development/wbs-dev lint
```

The implementation beneath `development/scripts/` is internal. Changes to local and CI behavior should continue to flow through `wbs-dev` so both environments exercise the same code path.
