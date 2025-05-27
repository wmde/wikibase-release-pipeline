# 10) Queryservice tarball {#adr_0010}

Date: 2021-01-20

## Status

accepted

## Context

For the building of the queryservice docker image we are currently using the versioned release tarballs [published by the WMF](https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service).

This package already contains all the required components to build the docker image and we don't see any reason to alter or publish these releases further.

## Decision

Do not produce a queryservice tarball to be published.

## Consequences

- Use the existing queryservice release tarball for building the docker images.
- When building and tagging the docker image the WMF release version should be used.
