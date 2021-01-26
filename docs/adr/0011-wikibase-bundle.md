# 11) Wikibase bundles {#adr_0011}

Date: 2021-01-26

## Status

accepted

## Context

A key part of release pipeline is to produce a bundled wikibase docker image prepared with the extensions and components known as the "wikibase suite".
This bundle image will consist of the build artifacts and as described in [ADR0001](0001-docker-image-repository.md) we've decided these images should be published to dockerhub.

In previous wikibase docker artifacts WMDE has offered a "base" and a "bundled" version of Wikibase, the new pipeline should still produce and publish these artifacts. The base image did only contain mediawiki and wikibase.

As we publish our releases we also need to make a decision if we want this bundle version to be available in a tarball for the user to install manually.

## Decision

The wikibase release pipeline will not produce a bundled tarball. 

## Consequences

- No bundled tarball will be produced
- A bundled wikibase docker image and a base image will be produced

