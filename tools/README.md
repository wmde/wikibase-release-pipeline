# Wikibase Suite tools

This directory contains the host-side scripts and development documentation for the Wikibase Suite installation and operations tools. The downloaded [install](../install) bootstrap and the checkout-local [wbs](../wbs) command invoke these scripts. The containerized application source and image definition are maintained under [`development/images/wbs-tools`](../development/images/wbs-tools).

For normal installation instructions, start with [Install Wikibase Suite](../docs/install.md).

During installation, the installer:

1. Checks for and installs Git if it is not already available.
2. Downloads Wikibase Suite to `~/wikibase-suite` if the script is not already running from a local checkout.
3. Checks for and installs Docker unless it is already installed.
4. Opens the browser UI to guide the user through configuration.
5. Shows the finalized configuration and links to the running services once complete.

## Development

Use this section only when developing, reviewing, or testing the tools.

- [docs/README.md](docs/README.md) covers the bootstrap, checkout-local CLI, localhost installation, installer UI development, and WBS refs.
- [docs/adrs/README.md](docs/adrs/README.md) lists architecture decision records.
