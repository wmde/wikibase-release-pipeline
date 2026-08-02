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

## Installer entry points

The downloaded bootstrap is browser-first. It installs Git when needed, selects
and checks out the latest stable WBS release, and then delegates to that
release's `wbs` command:

```bash
bash <(curl -fsSL https://github.com/wmde/wikibase-suite/raw/main/install)
```

From an existing checkout, use the location-independent root command. It
resolves the rest of the repository relative to its own path, so it can be
invoked while your shell is in another directory:

```bash
/path/to/wikibase-suite/wbs install
/path/to/wikibase-suite/wbs install --web
```

`wbs install` uses the terminal wizard by default. `wbs install --web` uses the
browser UI. Both paths use the same containerized Commander entry point and the
same host orchestration scripts.

For local networking, add `--local`. This retains the normal dependency and
checkout behavior; it only selects the no-public-domain networking mode. The
installer then defaults to:

```bash
WIKIBASE_PUBLIC_HOST=wikibase.test
WDQS_PUBLIC_HOST=query.wikibase.test
```

Add those hosts to your system hosts file before launching the stack.

## Checkout command options

| Option | Description |
| --- | --- |
| `--web` | Use the browser UI instead of the default terminal wizard. |
| `--dev` | Develop the browser installer from the current checkout with live reload. Implies `--local` and assumes dependencies are installed. |
| `--local` | Use local hostnames without public DNS validation or public certificates. |
| `--debug` | Enable verbose logging and disable quiet Docker pulls. |

The downloaded bootstrap additionally accepts `--wbs-ref REF` to check out a
specific WBS branch or tag. It defaults to browser mode and deliberately does
not expose checkout-only `--dev` behavior.

The old `--cli`, `--skip-clone`, `--skip-deps`, `--skip-launch`, and `--reset`
options were never part of a published interface and are not supported.

## Developing the browser installer

From an existing checkout, run:

```bash
./wbs install --dev
```

This builds the WBS tools image from `development/images/wbs-tools`, mounts the
application source for live reload, opens the browser installer, and implies
`--local`. It assumes Git and Docker are already installed. It does not build
the product images; use `development/wbs-dev build` when those sources changed.

## Runtime behavior

- Remote installs discover the highest stable `wbs@MAJOR.MINOR.PATCH` tag and clone it to `~/wikibase-suite`. Set `WBS_DIR` to use a custom checkout path.
- Normal installations pull the exact WBS tools image selected by the installation scripts. Set `WBS_TOOLS_IMAGE` to test a different published image.
- The installer web server runs on port `8888` for browser UI installations.
- For non-localhost web installs, the installer tries to obtain a Let's Encrypt certificate on port `80`. If that fails, it falls back to a self-signed certificate and the browser will warn.
- If `docker-compose.local.yml` exists in the Wikibase Suite directory, it is merged automatically.
- After launch, the saved `.env` configuration is displayed. Store credentials securely.
