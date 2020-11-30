# 5) Release notes process {#adr_0005}

Date: 2020-11-30

## Status

proposed

## Context

As we adopt our new release strategy we also want to determine a process for writing and maintaining release notes within the repository of Wikibase.

Seeing that our release process will still be closely bound to the release branches WMF are using it makes sense to inspect their process for producing and  maintaining release notes within the source control system.

Each release branch contains a RELEASE_NOTES-N.NN document describing changes that was made to the software up until the point the branch was cut from master. Any backports to these branches also comes with an update to the release notes document.  

As a new release branch is cut/created a new [template] release document is added to the master branch and any previous release notes are merged into a [HISTORY] document within the repository containing all previous release notes.

These are the different topics covered in the MediaWiki release notes [template]

- Configurations
  - New configurations
  - Changed configurations
  - Removed Configurations
- Features
  - New user-facing features
  - New developer features
- External Library changes
  - New external libraries
  - New development-only external libraries
  - Changed external libraries
  - Changed development-only external libraries
  - Removed external libraries
- Action API changes
- Languages updated
- Breaking changes
- Deprecations
- Other changes

## Decision

Release notes within the Wikibase MediaWiki extension repository will adopt a similar process to the one being used by the MediaWiki/core developers. 

## Consequences

- [A template release notes document] will be introduced in this repository to be used in for Wikibase releases
- New release branches will contain a release notes document with the same name as the release branch (REL1_36 would contain RELEASE_NOTES-1.36)
- Release notes for the next release RELEASE-NOTES-N.NX will added to the master/main branch of the repository.
- On a new release, the previous release RELEASE-NOTES-N.NY will be removed from the branch and it's contents added into the HISTORY document for archiving.
- New changes will be documented by the team as they are merged into the master branch and filed under the suiting topic described in context

[A template release notes document]: (../templates/RELEASE_NOTES-N.NN)
[template]: https://gerrit.wikimedia.org/r/c/mediawiki/core/+/611247/3/RELEASE-NOTES-1.36
[HISTORY]: https://gerrit.wikimedia.org/r/c/mediawiki/core/+/611247/3/HISTORY
[Query Service UI]: https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query/gui

