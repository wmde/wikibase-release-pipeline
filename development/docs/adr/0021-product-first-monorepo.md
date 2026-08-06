# Product-first monorepo

## Status

Proposed

## Context

Wikibase Suite consists of the supported Docker Compose configuration, installer, operational documentation, and the container images used by that configuration. The image definitions, integration tests, and release tooling historically lived beside the product under a repository structured and named as a release pipeline.

Separating the product configuration into another repository would require every coordinated release to identify, test, review, and merge matching commits across two repositories.

## Decision

Keep Wikibase Suite and its image development pipeline in one repository and organize it around the user-facing product:

- The repository root contains the installable Compose product, installer, configuration, changelog, and user documentation.
- `docs/` contains the user-facing WBS documentation index and operations guides, with installation, configuration, and migration guides grouped in dedicated subdirectories.
- `docker-images/` contains each independently usable image's README, changelog, Dockerfile, and build inputs.
- `development/tests/` contains the integration test suite.
- Shared build and release tooling remains under `development/`.

GitHub workflow definitions remain under the required root `.github/` location but invoke the tooling in `development/`.

## Consequences

- A single commit identifies the Compose configuration, image definitions, documentation, and integration tests for a release candidate.
- Users cloning the repository also receive development files, but do not need to enter or use `development/` for normal installation and operation.
- Existing installations must move ignored `.env` and `config/` contents from `deploy/` to the repository root when upgrading to the flattened layout.
- The repository can be renamed to `wikibase-suite` separately from the filesystem reorganization.
