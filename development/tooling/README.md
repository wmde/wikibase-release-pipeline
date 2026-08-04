# Development tooling

This directory contains the implementation behind `./wbs-dev`. `wbs-dev` is the supported human and CI entry point; files here are internal building blocks rather than separate command interfaces.

Use `./wbs-dev --help` and its subcommand help for the public command surface. Call that wrapper rather than invoking files in this directory directly.

- `build/` owns product image-build coordination.
- `installer-dev/` launches and adapts the installer for manual development.
- `lint/` owns lint target selection and execution.
- `test/` coordinates tooling checks and integration suites.
- `prepare/` updates upstream source pins, versions, and changelogs.
- `release/` validates and publishes reviewed releases.
- `buildx.sh` provides shared BuildKit setup for the development image and
  product images.
- `container-entrypoint.sh` initializes the development tooling container.

The development image's `Dockerfile` lives beside `docker-compose.yml` and
`wbs-dev` at the `development/` root. The launcher builds that image before
starting the TypeScript CLI.

All JavaScript and TypeScript development-tool dependencies—including the test harness—are owned by `development/package.json`. Image package manifests remain under `development/images` because they provide image names and versions as well as workspace metadata.

Keep orchestration and argument validation in TypeScript. Keep shell scripts for direct process setup and commands whose array and environment handling is clearer in the shell. Local development and GitHub Actions should call `./wbs-dev` so both paths exercise the same implementation.
