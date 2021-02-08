# 12) Versioning {#adr_0012}

Date: 2021-02-08

## Status

proposed

## Context

WMF does during their release process create a number of branches which are used during the release process to orchestrate the different tools to produce the correct artifacts and to support the continuous deployment to production. The release branches (ex. REL1_35) are cut for MediaWiki and every extension repository with the purpose of maintaining releases and the weekly deployment branches are (ex. wmf/1.36.0-wmf.13) are used to deployments to the different [groups](https://versions.toolforge.org/). 

Both of these types of branches are maintained by the WMF and will be used by the wikibase release strategy for our major releases and deployment. However we need to decide how to maintain our own intermediate releases that will be published on releases.wikimedia.org, dockerhub and tagged on git.

As there we will still rely on the release branches and deployment branches, we don't see any real benefit by maintaining an additional set of branches for minor releases. These releases could still be maintained through git tagging the WMDE controlled repositories at the point in time a release is produced ([similar to how mediawiki is maintaining their release candidates](https://gerrit.wikimedia.org/g/mediawiki/core/+/refs/tags/1.35.0-rc.0)). 


As for the tag itself we also need to decide on version-numbering scheme for differentiating releases where the WMF version number does not change. Seeing that MediaWiki is already using the semantic versioning for incrementing their (maintenance releases) releases in between new release branches being cut it makes sense for wikibase to adopt a similar process as we will still rely on the release branches for future releases.

Example: The patch release following 1.35 (1.35.0) will be known as 1.35.1 

## Decision

- Do not create branches for every release
- Use the semantic versioning scheme already in place.

## Consequences

- We will not create branches of every minor version number we release. Instead we will use tagging.
- Releases in between new release branches being cut will be versioned using the semantic versioning scheme already in place. 


