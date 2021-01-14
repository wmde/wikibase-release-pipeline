# 5) Wikibase Extension release notes publishing {#adr_0007}

Date: 2021-01-14

## Status

proposed

## Context

We have in [ADR0005] adopted the process for maintaining our release notes within the repository we also want to make a decision as to where these should be published for a broader audience.

As our process for maintaining release notes will be closely modeled after mediawiki it also makes sense to review how mediawiki is publishing theirs.

The [template] used for describing the different release notes topics is based on wikitext that after a release branch is cut and the template has been populated with the relevant changes, is to serve as the base for a richer curated version on mediawiki.org [(Example: 1.35)](https://www.mediawiki.org/wiki/Release_notes/1.35).

## Decision

Adopt a similar process to that of mediawiki and publish release notes on mediawiki.org

## Consequences

- An overview of the wikibase release notes will be presented on https://www.mediawiki.org/wiki/Wikibase/Release_notes in a similar manner to that of [mediawiki](https://www.mediawiki.org/wiki/Release_notes)
- Each major release will have a curated version of the release notes maintained within the repository published under https://www.mediawiki.org/wiki/Wikibase/Release_notes/N.NN with further links to relevant documentation and phabricator tickets.

[template]: https://gerrit.wikimedia.org/r/c/mediawiki/core/+/611247/3/RELEASE-NOTES-1.36
[ADR0005]: (update_once_its_merged!)