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

Git and Docker with the Compose and Buildx plugins are required. Node.js, pnpm, Python, and the linters do not need to be installed on the host: `wbs-dev` runs them in the `wbs-dev` container.

See the [local development guide](./local-development.md) for environment setup, local overrides, cache behavior, and common workflows.

Run `development/wbs-dev --help` or `development/wbs-dev <command> --help` for the current command-line reference.

## Selection and option rules

Targets follow the command directly. A `--` separator is not required. Once an option is encountered, it and the remaining arguments are forwarded to the underlying tool where applicable.

| Command | Default with no target | Explicit `all` | Forwarded options |
| --- | --- | --- | --- |
| `build` | all images | supported | Docker Buildx options |
| `test` | all suites, sequentially | supported | test runner and WebdriverIO options |
| `lint` | repository root | selects the root default | lint options |
| `update-sources` | none; a project or `all` is required | supported alone | `--dry-run` only |
| `update-versions` | none; a project or `all` is required | supported alone | `--dry-run` only |
| `release` | displays subcommand help | selected by its subcommand | `--dry-run` only |

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

Test commands build all images once before running any selected suites. Local Docker layer caching keeps unchanged builds inexpensive. Use `--skip-build` only when the required images were already built by a separate step, as they are in CI.

For a locally named custom build from a branch:

```bash
development/wbs-dev build wikibase \
  --tag example.registry/team/wikibase:my-branch
```

This loads the custom tag locally; pushing it to a registry remains a separate, explicit operation. Official image publication is deliberately explicit and requires exactly one image:

```bash
development/wbs-dev build wikibase --publish
```

That command publishes the stable version tags derived from the image package to Docker Hub. It is normally called by tag-triggered CI rather than by an operator.

## Test

```bash
# Tooling fixtures followed by every integration suite
development/wbs-dev test

# Only the fast wbs-dev fixture tests
development/wbs-dev test tooling

# One suite
development/wbs-dev test repo

# Use images already built by a separate step
development/wbs-dev test repo --skip-build

# One spec in a suite's environment
development/wbs-dev test repo --spec suites/repo/specs/special-new-item.ts

# Start a suite environment and leave it running
development/wbs-dev test queryservice --setup
```

The default test command first runs the fast `tooling` fixture tests and then the integration suites. Available integration suites and their coverage are documented in the [test guide](../test/README.md). Local suites use the most recently built `wikibase/*:latest` images. CI points the same suites at images built and tagged for that workflow run.

## Develop the installer UI

The product-facing `wbs` command is separate from the repository task runner. From any directory, invoke it through the path to the checkout:

```bash
/path/to/wikibase-suite/wbs install --dev
```

This builds `wbs-tools` from the current checkout, starts the browser installer with live reload, uses local `.test` hostnames, and assumes Git and Docker are already installed. Configure those hostnames as described in the [local development guide](./local-development.md#develop-the-installer-ui). It does not build the Wikibase Suite product images. Use `development/wbs-dev build` separately when those images have changed.

For a complete installation test of an unpublished checkout, use `./install --build` instead. This builds the tools and product images from the checkout and then runs the normal installer.

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

## Update images from upstream sources

```bash
# Preview every supported source update
development/wbs-dev update-sources all --dry-run

# Update selected pins
development/wbs-dev update-sources wikibase wdqs-frontend
```

The supported targets are `wikibase`, `wdqs-frontend`, and `quickstatements`. This command changes source pins only. It restores all selected source files if one selected updater fails.

## Update release versions

`update-versions` fetches authoritative tags from `origin`, infers semantic versions from release-driving Conventional Commits and relevant working-tree changes, and updates versions and changelogs together:

```bash
development/wbs-dev update-versions wikibase wbs --dry-run
development/wbs-dev update-versions wikibase wbs
```

No files are staged or committed. A manually written untagged changelog draft is preserved, while an empty or absent draft receives a simple generated entry. See the [release guide](./releasing.md) for the inference and review rules.

## Release

The **Create a WBS Release** GitHub workflow on `main` is the supported publication entry point. It invokes these commands on the server:

```bash
development/wbs-dev release images wikibase quickstatements --dry-run
development/wbs-dev release images wikibase quickstatements
development/wbs-dev release wbs
development/wbs-dev release all
```

`release images` defaults to all images when no names are supplied. `release wbs` requires every full-version image tag on Docker Hub. `release all` pushes image Git tags one by one, waits for all images, and only then pushes the WBS tag. The command requires reviewed release metadata, a clean working tree, and a release commit available on the remote.

The commands provide the same behavior locally for development and debugging, but project convention is to create release tags only through the authenticated GitHub workflow. Follow the [release process](./releasing.md) rather than publishing from a development machine.

The implementation beneath `development/scripts/` is internal. Changes to local and CI behavior should continue to flow through `wbs-dev` so both environments exercise the same code path.
