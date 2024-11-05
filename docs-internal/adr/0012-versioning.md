# 12) Versioning {#adr_0012}

Date: 2021-02-08

## Status

accepted

## Context

WMF does during their release process create a number of branches which are used during the release process to orchestrate the different tools to produce the correct artifacts and to support the continuous deployment to production. The release branches (ex. REL1_35) are cut for MediaWiki and every extension repository with the purpose of maintaining releases and the weekly deployment branches are (ex. wmf/1.36.0-wmf.13) are used to deployments to the different [deployment groups](https://versions.toolforge.org/).

Both of these types of branches are maintained by the WMF and will be used by the wikibase release strategy. However we need to decide how to maintain our own intermediate releases that will be published on releases.wikimedia.org, dockerhub and tagged on git.

As we will still rely on the release branches and deployment branches, we don't see any real benefit by maintaining an additional set of branches for minor releases. These releases could still be maintained through git tagging the WMDE controlled repositories at the point in time a release is produced ([similar to how mediawiki is maintaining their release candidates](https://gerrit.wikimedia.org/g/mediawiki/core/+/refs/tags/1.35.0-rc.0)).

As for the tag itself we also need to decide on version-numbering scheme for differentiating releases where the WMF version number does not change. Seeing that MediaWiki is already using a versioning scheme for incrementing their (maintenance) releases in between new release branches being cut it could make sense for wikibase to adopt a similar process as we will still rely on the release branches for future releases.

Example: The patch release following 1.35 (1.35.0) will be known as 1.35.1

However adopting the same scheme for Wikibase also presents some additional risks of adding confusion to what is to be included in a release as our release cycle will not always align perfectly with the one of MediaWiki.

Example:

1. We release 1.35.0 which contains Mediawiki 1.35.0.
2. We release 1.35.1 which contains Mediawiki 1.35.0 and also some additional extensions and bug fix to Quickstatements.
3. WMF releases a 1.35.1 security patch release of Mediawiki
4. We release 1.35.2 which contains Mediawiki 1.35.1 (and the previous changes mentioned)

For this reason we probably want to adopt adopt another scheme in order to avoid this confusion. Looking at the MediaWiki naming convention for release candidates (`1.35.0-rc.0`) something along these lines might be sufficient to prevent any confusion.

## Decision

- Do not create branches for every release
- Use `-wmde.N` as a suffix to indicate version where N is incremented between releases

## Consequences

- We will not create branches of every minor version number we release. Instead we will use tagging.
- Releases in between new release branches being cut will be versioned by appending our own version number to the mediawiki version.

Example: A Wikibase release based on 1.35.0 would be versioned as 1.35.0-wmde.0 Example: A queryservice frontend release would be versioned wmde.0, wmde.1 etc.
