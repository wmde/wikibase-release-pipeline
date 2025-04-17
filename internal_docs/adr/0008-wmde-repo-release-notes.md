# 8) Release notes WMDE owned repositories {#adr_0008}

Date: 2021-01-15

## Status

accepted

## Context

In [ADR0005] we are proposing a process for maintaining release notes within the Wikibase repository. The Wikibase repository and some additional WMDE owned repositories are bound to the release branches as a [compatibility policy](https://www.mediawiki.org/wiki/Compatibility#mediawiki_extensions).

Currently only mediawiki related code (core, skins, extensions) is covered by this compatibility policy and could easily apply the same process for maintaining and publishing release notes as to that what has been proposed to be used by Wikibase ([ADR0005], [ADR0007]).

### WMDE owned repositories currently bound to release branches

- [WikibaseManifest](https://www.mediawiki.org/wiki/Extension:WikibaseManifest)
- [EntitySchema](https://www.mediawiki.org/wiki/Extension:EntitySchema)
- [WikibaseQualityConstraints](https://www.mediawiki.org/wiki/Extension:WikibaseQualityConstraints)

### WMDE owned/maintaned repositories not bound to release branches:

- [Wikidata Query GUI](https://gerrit.wikimedia.org/r/admin/repos/wikidata/query/gui)

The Wikidata Query GUI is the exception of the WMDE owned repositories that we intend to include. In order to adopt the same process as proposed to be used by Wikibase we would either need to cut our own release branches or adopt some other process.

### Current usage of release notes by WMF

A quick review showed that the following [5 most downloaded WMF extensions](https://grafana.wikimedia.org/d/000000161/extension-distributor-downloads?orgId=1&from=now-5y&to=now&var-release=REL1_35&var-groupby=1d) do not maintain or publish release notes.

| Name                | Release notes | Historic release notes |
| ------------------- | ------------- | ---------------------- |
| VisualEditor        | no            | no                     |
| MobileFrontend      | no            | no                     |
| LDAPAuthentication2 | no            | no                     |
| PluggableAuth       | no            | no                     |
| TemplateStyles      | no            | no                     |

This is of course not ideal but could be interpreted as a hint that writing and maintaining release notes for all extensions is a cumbersome task that should only be done for the repositories we deem to be our main products and bring the biggest impact.

## Decision

For the first release to use the our new strategy the Wikibase extension will be the only repository to include release notes. This decision will be re-evaluated after the first successful release to minimize the initial burden on the team.

## Consequences

- Write release notes for the Wikibase Extension
- After the first successful release this decision will be re-evaluated and possibly applied to a selection of the repositories that support them.

[ADR0005]: (0005-release-notes-process.md)
[ADR0007]: (0007-wikibase-release-notes-publish.md)
