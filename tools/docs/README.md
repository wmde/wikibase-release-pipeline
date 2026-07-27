# Wikibase Suite tools development

This document covers local testing, advanced installer options, and the current release model for the installer code.

The installer currently supports first-time Wikibase Suite installation through a web UI or command-line wizard. It is also intended to become the foundation for a broader `wbs` operations CLI with commands for installing, backing up, resetting, upgrading, updating, and maintaining a Wikibase Suite instance. See [ADR 0001: Expand the Installer into an Operations Tool](adrs/0001-expand-installer-into-operations-tool.md).

## Versioning and releases

The containerized application is released independently as the [`wikibase/wbs-tools` image](../../docs/images/wbs-tools/README.md), using `wbs-tools@X.Y.Z` release tags. Each WBS release selects an exact compatible tools image version.

A change to the tools can therefore produce a tools image release without changing the WBS configuration. A WBS release is still required before normal installation selects that new image version.

Use Conventional Commits for changes in this repository so future release tooling can derive semantic version bumps and changelog entries from commit history.

The branch and tag model is:

- `main` hosts the public bootstrap script at `raw/main/install`. The bootstrap discovers and installs the latest stable `wbs@…` tag.
- `dev` is the integration branch for the next release.
- Wikibase Suite release tags use the format `wbs@X.Y.Z`.
- WBS tools image release tags use the format `wbs-tools@X.Y.Z`.
- New development should happen on `dev` or feature branches, then merge to `main` only when ready to become the public installer path.

## Running locally

Clone the repository and run from the directory that contains `install`:

```bash
git clone https://github.com/wmde/wikibase-suite
cd wikibase-suite
./install [OPTIONS]
```

For local development, use `--dev` or `--local`:

```bash
./install --dev
```

`--dev` sets `LOCALHOST=true` and skips dependency installs. When using `--local` or `--dev`, the installer defaults to:

```bash
WIKIBASE_PUBLIC_HOST=wikibase.test
WDQS_PUBLIC_HOST=query.wikibase.test
```

Add those hosts to your system hosts file before launching the stack.

## Options

| Option | Description |
| --- | --- |
| `--web` | Use the browser UI. This is currently the default. |
| `--cli` | Collect configuration through the command-line wizard. |
| `--dev` | Local development shortcut: sets `LOCALHOST=true` and skips dependency installs. |
| `--local` | Configure for localhost domains and avoid Let's Encrypt. |
| `--reset` | Interactive reset. Optionally deletes `.env`, `LocalSettings.php`, and existing services/data before relaunch. |
| `--skip-clone` | Do not clone the Wikibase Suite repository. Assumes it is already present. |
| `--skip-deps` | Skip installing Git and Docker. Assumes both are installed and Docker is running. |
| `--skip-launch` | Run through configuration but exit before `docker compose up`. |
| `--wbs-ref REF` | Checkout a specific Wikibase Suite branch or tag instead of the latest stable `wbs@…` release. |
| `--debug` | Enable verbose logging and disable quiet Docker pulls. |

## Runtime behavior

- Remote installs discover the highest stable `wbs@MAJOR.MINOR.PATCH` tag and clone it to `~/wikibase-suite`. Set `WBS_DIR` to use a custom checkout path.
- Normal installations pull the exact WBS tools image selected by the installation scripts. Set `WBS_TOOLS_IMAGE` to test a different published image.
- `--dev` builds the WBS tools image from `development/images/wbs-tools` instead of pulling it, so local source changes are included.
- The installer web server runs on port `8888` for browser UI installations.
- For non-localhost web installs, the installer tries to obtain a Let's Encrypt certificate on port `80`. If that fails, it falls back to a self-signed certificate and the browser will warn.
- If `docker-compose.local.yml` exists in the Wikibase Suite directory, it is merged automatically.
- After launch, the saved `.env` configuration is displayed. Store credentials securely.
