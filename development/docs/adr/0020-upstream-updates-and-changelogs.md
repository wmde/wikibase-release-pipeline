# 20) Generate upstream updates and image changelogs {#adr_0020}

Date: 2026-08-03

## Status

Proposed

## Context

Image updates currently require release operators to identify appropriate upstream versions, update source pins, inspect compatibility, and manually assemble useful release notes. The generic versioning tool can infer a semantic version from repository commits, but it does not understand upstream release lines or describe the software changes contained in a refreshed image.

This is especially visible when updating:

- Wikibase to a newer compatible MediaWiki release and matching extension commits.
- Query Service to a newer compatible WDQS release.
- Images whose useful changelog should link to upstream release notes and commit or tag comparisons.

## Decision

Extend `./wbs-dev update-sources` with image-specific update providers. Each provider will select or propose compatible upstream versions, update related pins atomically, and produce structured metadata describing the old and new sources.

Use that metadata during release preparation to generate image-specific changelog drafts. For example, a Wikibase Docker Image entry should identify the MediaWiki update, link to its release notes, and link to comparison ranges for bundled extension updates. A WDQS entry should identify and link to the selected Query Service release and comparison.

Generated output remains a proposal: operators review compatibility, semantic-version impact, links, and wording before committing it. Automatic updates must respect the compatibility policy in each image's `UPDATING.md`; they must not silently cross an incompatible release boundary.

## Consequences

Update logic and changelog provenance become image-specific while orchestration, atomic file updates, and review remain shared. Provider metadata needs a stable internal format that can support both human-readable previews and changelog generation. Initial implementation can cover Wikibase and WDQS, with other images added only where upstream metadata makes the automation reliable.
