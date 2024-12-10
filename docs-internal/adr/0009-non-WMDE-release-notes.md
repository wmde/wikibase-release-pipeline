# 9) Release notes for software not maintained by WMDE {#adr_0009}

Date: 2021-01-15

## Status

accepted

## Context

We intend to package and release software that is not maintained by WMDE. For example, the Wikidata Query Service (WDQS).

This software comes from a variety of sources including software that is used and maintained by the WMF in Wikimedia production Wikis but also some from complete third parties.

Some of this software including ElasticSearch and WikibaseLocalMedia already have curated release notes for versions.

Other software such as WDQS and Mediawiki extensions do not have release notes. They may have notable changes documented either in git commit messages or in phabricator tickets linked to those commits. It could be possible to computationally extract a compile these with some effort.

Software such as QuickStatements may prove difficult to build release note from git. It may require inspecting the code changes by eye.

Compiling release notes for software we do not maintain would add a significant maintenance burden.

## Decision

We will not write custom release notes for software that we do not maintain.

We will attempt to forward already curated release notes from upstream maintainers.

## Consequences

When adding components to the release pipeline that have curated release notes we should merge these release notes into the appropriate artifacts.

If upstream components start providing release notes we should make changes to include them in the appropriate artifacts when possible.

Other components may have significant changes that we might fail to inform users of in advance.
