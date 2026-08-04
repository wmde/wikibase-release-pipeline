# Wikibase Suite tools development

This document covers local testing, advanced installer options, and the current release model for the installer code.

The installer currently supports first-time Wikibase Suite installation through a web UI or command-line wizard. It is also intended to become the foundation for a broader `wbs` operations CLI with commands for installing, backing up, resetting, upgrading, updating, and maintaining a Wikibase Suite instance. See [ADR 0001: Expand the Installer into an Operations Tool](adrs/0001-expand-installer-into-operations-tool.md).

## Versioning and releases

The containerized application is released independently as the [`wikibase/wbs-tools` image](../../../../docs/images/wbs-tools/README.md), using `wbs-tools@X.Y.Z` release tags. WBS selects a compatible tools major version.

Compatible minor and patch tools releases become available to normal installations without changing the WBS configuration. A WBS release is required to select a new tools major version.

Use Conventional Commits for changes in this repository so future release tooling can derive semantic version bumps and changelog entries from commit history.

The branch and tag model is:

- `main` hosts the public bootstrap script at `raw/main/install`. The bootstrap discovers and installs the latest stable `wbs@…` tag.
- `dev` is the integration branch for the next release.
- Wikibase Suite release tags use the format `wbs@X.Y.Z`.
- WBS tools image release tags use the format `wbs-tools@X.Y.Z`.
- New development should happen on `dev` or feature branches, then merge to `main` only when ready to become the public installer path.

## Installer entry points

The downloaded bootstrap is browser-first. It installs Git when needed, selects and checks out the latest stable WBS release, and then delegates to that release's `wbs` command:

```bash
bash <(curl -fsSL https://github.com/wmde/wikibase-suite/raw/main/install)
```

From an existing checkout, use the location-independent root command. It resolves the rest of the repository relative to its own path, so it can be invoked while your shell is in another directory:

```bash
/path/to/wikibase-suite/wbs install
/path/to/wikibase-suite/wbs install --web
```

`wbs install` uses the terminal wizard by default. `wbs install --web` uses the browser UI. Both paths use the same containerized Commander entry point and the same host orchestration scripts.

For local networking, add `--local`. This retains the normal dependency and checkout behavior; it only selects the no-public-domain networking mode. The installer then defaults to:

```bash
WIKIBASE_PUBLIC_HOST=wikibase.test
WDQS_PUBLIC_HOST=query.wikibase.test
```

Add those hosts to your system hosts file before launching the stack.

## Checkout command options

| Option | Description |
| --- | --- |
| `--web` | Use the browser UI instead of the default terminal wizard. |
| `--installer-dev` | Develop the browser installer from the current checkout with live reload. Implies `--local` and assumes dependencies are installed. |
| `--from-source` | Build WBS tools and all product images from the selected source checkout before installing. |
| `--local` | Use local hostnames without public DNS validation or public certificates. |
| `--debug` | Enable verbose logging and disable quiet Docker pulls. |

The downloaded bootstrap additionally accepts `--wbs-ref REF` to check out a specific WBS branch or tag. It defaults to browser mode and deliberately does not expose checkout-only `--installer-dev` behavior.

The old `--cli`, `--skip-clone`, `--skip-deps`, `--skip-launch`, and `--reset` options were never part of a published interface and are not supported.

## Developing the browser installer

From an existing checkout, run:

```bash
./wbs install --installer-dev
```

This builds `wikibase/wbs-tools:latest` through `development/wbs-dev`, mounts the application source for live reload, opens the browser installer, and implies `--local`. It assumes Git and Docker are already installed. It does not build the product images; use `./development/wbs-dev build` when those sources changed.

To test a complete installation from the current checkout, build the tools and product images before starting the installer:

```bash
./install --from-source
```

To install another unpublished branch or tag, select it in the downloaded bootstrap and add `--from-source`:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/wmde/wikibase-suite/main/install) \
  --wbs-ref BRANCH_OR_TAG \
  --from-source
```

This builds every image through `development/wbs-dev` and selects `development/docker-compose.local-images.yml` for the checkout. Local builds retain the development build system's normal `latest` tags; they do not replace the published compatible-major tags. Remove `.wbs/local-images` to return the installation to published image tags. Source builds require more time, CPU, memory, and storage than a normal installation. They anonymously reuse the public build cache produced by CI in GHCR; prefix the command with `BUILD_CACHE_REGISTRY=` to use only the server's local BuildKit cache. Build output is written to `/tmp/wikibase-suite-installer.log`; add `--debug` to stream it in the terminal.

## Runtime behavior

- Remote installs discover the highest stable `wbs@MAJOR.MINOR.PATCH` tag and clone it to `~/wikibase-suite`. Set `WBS_DIR` to use a custom checkout path.
- Normal installations pull the compatible WBS tools major selected by the installation scripts, currently `wikibase/wbs-tools:1`. Set `WBS_TOOLS_IMAGE` to test a different published image.
- Source installations requested with `--from-source` use `wikibase/wbs-tools:latest` and `development/docker-compose.local-images.yml`; `.wbs/local-images` records the product-image selection.
- Installer development requested with `--installer-dev` builds and uses `wikibase/wbs-tools:latest` without changing the product-image selection.
- The installer web server runs on port `8888` for browser UI installations.
- For non-localhost web installs, the installer tries to obtain a Let's Encrypt certificate on port `80`. If that fails, it falls back to a self-signed certificate and the browser will warn.
- If `docker-compose.local.yml` exists in the Wikibase Suite directory, it is merged automatically.
- After launch, the saved `.env` configuration is displayed. Store credentials securely.

## Local installer state

The ignored `.wbs/` directory contains state used only by the temporary browser installer and source-image selection:

- `.wbs/local-images` selects the tracked `development/docker-compose.local-images.yml` override.
- `.wbs/certs/` contains the certificate and private key presented by the temporary installer web server on port `8888`.
- `.wbs/letsencrypt/` contains the temporary installer's Let's Encrypt account and certificate-request state.

The certificate directories are regenerated when needed and are separate from the installed Wikibase Suite HTTPS certificates. The running product's Traefik certificates are stored in the `traefik-letsencrypt-data` Docker volume.
