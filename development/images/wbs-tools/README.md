# Wikibase Suite tools

This directory contains the containerized Wikibase Suite configuration, installation, and lifecycle application. The downloaded [install](../../../install) bootstrap hands off to the internal host launcher, while [`development/wbs`](../../wbs) provides an explicitly experimental developer entry point.

For normal installation instructions, start with [Install Wikibase Suite](../../../docs/install.md).

During a new installation:

1. The bootstrap checks for Docker and installs it when necessary.
2. The bootstrap pulls the compatible published `wbs-tools` image.
3. The tools image uses its bundled Git client to clone the selected WBS release to `~/wikibase-suite`.
4. The checkout launches the browser configurator without exposing the Docker socket to it.
5. A separate, non-networked worker from the same image receives the Docker socket, starts the services, and reports progress through the installation log.

The same image also implements the terminal configurator and the currently internal, experimental `wbs up`, `down`, `status`, and `reset` commands. They are available for development and architectural testing but are not yet an announced end-user operations interface. Its source is organized by runtime boundary: [`wbs.ts`](wbs.ts) registers commands, [`cli/`](cli) contains terminal interaction, [`shared/`](shared) contains reusable configuration and Docker operations, and [`web/`](web) contains the server and browser client.

## Development

Use this section only when developing, reviewing, or testing the tools.

- [docs/README.md](docs/README.md) covers the bootstrap, experimental development CLI, localhost installation, installer UI development, and WBS refs.
- [docs/adrs/README.md](docs/adrs/README.md) lists architecture decision records.
