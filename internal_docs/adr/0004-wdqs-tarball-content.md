# 4) WDQS tarball contents {#adr_0004}

Date: 2020-11-23

## Status

accepted

## Context

Unlike in the case of Mediawiki extensions, where the extension code is packaged as a tarball to be installed in end user's environment, there is no immediate idea of how to package the Query Service (in particular as it actually involves a number of software components). Components included [Query Service backend] (including the WMF Blazegraph fork) and [Query Service UI]. Should these be bundled as separate tarballs? Or as a single one?

[Query Service backend] releases is currently [built and published](https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query/rdf/+/refs/heads/master/dist/) as a [service zip archive] which contains the necessary components including the built-in UI of blazegraph.

The [Query Service UI] has at one point been part of this build process but the two components have recently been [separated](https://phabricator.wikimedia.org/T241291).

## Decision

As the [Query Service backend] does not depend on the [Query Service UI] and they are currently two separate components there is no need to alter the structure of the [service zip archive] as no obvious benefit of doing so can be identified.

## Consequences

- The [Query Service backend] will be released as a standalone component as described by the [service zip archive].
- The [Query Service UI] will be released as a standalone component.

[Query Service UI]: https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query/gui
[Query Service backend]: https://gerrit.wikimedia.org/r/plugins/gitiles/wikidata/query/rdf
[service zip archive]: https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/
