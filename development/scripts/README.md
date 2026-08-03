# Development scripts

This directory contains the implementation behind `./wbs-dev`. `wbs-dev` is the supported human and CI entry point; the shell and Python files here are internal building blocks rather than separate command interfaces.

Use `./wbs-dev --help` and its subcommand help for the public command surface. Call that wrapper rather than invoking files in this directory directly.

- `wbs-dev/` discovers targets, validates selections, and coordinates tasks.
- `test/` provides the Commander-based integration-test CLI and its container wrapper.
- `update-sources/` updates the upstream source pins used by supported images.
- `run-buildx.sh` provides shared BuildKit builder and registry-cache handling for tooling and product images.
- `build-image.sh`, `build-wbs-dev.sh`, and `lint.sh` perform their named tasks.
- `wbs-dev-entrypoint.sh` prepares the mounted workspace inside the `wbs-dev` container.

All JavaScript and TypeScript development-tool dependencies—including the test harness—are owned by `development/package.json`. Image package manifests remain under `development/images` because they provide image names and versions as well as workspace metadata.

Keep orchestration and argument validation in TypeScript. Keep shell scripts for direct process setup and commands whose array and environment handling is clearer in the shell. Local development and GitHub Actions should call `./wbs-dev` so both paths exercise the same implementation.
