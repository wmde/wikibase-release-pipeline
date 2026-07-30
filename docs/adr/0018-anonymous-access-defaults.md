# 18) Anonymous access defaults for the Wikibase image {#adr_0018}

Date: 2026-04-20

## Status

accepted

## Context

The Wikibase Suite Docker image ships a `LocalSettings.wbs.php` template which is appended to the generated `LocalSettings.php` on first install. Historically, that template also contained the logic for loading bundled configuration fragments from `build/wikibase/LocalSettings.d`.

That means the user-owned `LocalSettings.php` in the config volume has also contained image-managed bootstrap logic. If an operator edits that loading logic incorrectly, they can break the bundled configuration model of the image.

We want to change the default anonymous access model for the bundled Wikibase image used by Wikibase Suite. The goal is to require a logged-in account for write actions while keeping public read access available.

This decision is driven by two considerations:

- We want the Suite defaults to track Wikibase Cloud security decisions where that is practical for self-hosted defaults. In particular, we want to disable anonymous account creation by default, following the current Wikibase Cloud default as understood by the team for this decision.
- We want to keep anonymous read access available. In our current stack, anonymous read access is required for WDQS updates, and it is also a sensible default for public-facing Wikibase installations.

We also want this default to be easy to locate, reason about, and override by operators maintaining their own `LocalSettings.php`.

## Decision

The Wikibase image will keep anonymous read access enabled by default, but will disable anonymous write actions and anonymous self-service account creation by default.

The affected defaults will be implemented in:

`build/wikibase/LocalSettings.MediaWiki.php`

That location should contain only the non-default settings needed for this policy:

- `$wgGroupPermissions['*']['edit'] = false;`
- `$wgGroupPermissions['*']['createpage'] = false;`
- `$wgGroupPermissions['*']['createtalk'] = false;`
- `$wgGroupPermissions['*']['writeapi'] = false;`
- `$wgGroupPermissions['*']['createaccount'] = false;`

We will not add explicit settings for defaults we intend to leave unchanged, such as anonymous read access.

`LocalSettings.wbs.php` will become a thin wrapper that contains stable, image-managed `require_once` lines:

- `require_once '/LocalSettings.MediaWiki.php';`
- `require_once '/LocalSettings.Extensions.php';`

Between those lines, operators can place MediaWiki settings that must be set before bundled extensions are loaded. After the second line, operators can place settings that should be applied after bundled extensions are loaded.

The general MediaWiki defaults currently defined in `LocalSettings.wbs.php` will also move into `LocalSettings.MediaWiki.php`. The loop over `LocalSettings.d` will move into `LocalSettings.Extensions.php`. This keeps the critical loading logic in image-managed files, while preserving a supported pre-extension configuration section in the user-owned `LocalSettings.php`.

## Consequences

- Anonymous users will still be able to read wiki pages and access public read endpoints.
- Anonymous users will no longer be able to edit, create pages, create talk pages, use the write API, or create accounts.
- Browser tests that currently rely on anonymous writing will need to log in before creating or editing content.
- Operators who want different behavior will be able to override these image defaults in their own MediaWiki configuration.
