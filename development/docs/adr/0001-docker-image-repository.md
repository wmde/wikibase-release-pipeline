# 1) Use Dockerhub as a repository for docker images {#adr_0001}

Date: 2020-12-04

## Status

accepted

## Context

Currently the Wikibase docker images are built on travis and deployed to Dockerhub.

There are a number of existing docker repositories we could consider to host our images. We need not pick only one repository but for the purposes of documentaion and clarity we probably want a single canonical one then other repositories could then be "syndicated" from the canonical one.

Some key properties of existing registries were considered in the table below:

| Repository | Free to WMDE | Self-Service (1) | Tooling provided for a built-in pipeline | Visibility of built images (2) | Possibility of replication to repository | Restrictions on use of non-Wikimedia images |
| --- | --- | --- | --- | --- | --- | --- |
| Dockerhub | Currently (3) | Yes | Static builds from dockerfile | High | Yes | no |
| Github Container registry | Currently | Yes | Github Actions | Medium | Yes | no |
| Google Container Registry | No (pay for storage and egress) | Yes | Google Cloud | Medium | Yes | no |
| AWS Container registry | No (pay for storage and egress) | Yes | Amazon Cloud | Medium | Yes | no |
| Azure Container Registry | No (some complex structure) | Yes | Azure Container Registry Tasks | Medium | Yes | no |
| WMF Docker Registry | Yes | No (negotiation needed) | [https://wikitech.wikimedia.org/wiki/PipelineLib](https://wikitech.wikimedia.org/wiki/PipelineLib) | Low | No (probably not) | Yes (only audited versions of specific images are allowed) (4) |

1. We can create new images and names without filing a ticket for speaking to people
2. Approximate fraction of the market of docker pulls that happens here
3. Dockerhub introduces limitations in use - but WMDE will likely be entitled to a free unlimited "open source" plan
4. Potentially WMDE could get their space of the registry with more loose restrictions (discussion ongoing)

## Decision

We will publish Docker release images to Dockerhub. Dockerhub is the goto location for publishing Docker images. We do not consider publishing Wikibase Docker images to WMF Docker Registry yet, as its purpose is to hold images to be used in Wikimedia production infrastructure. This might change once Wikibase (i.e. MediaWiki and extensions) will be deployed using container images - not the case as of December 2020.

## Consequences

Publishing step of the Wikibase release pipeline will be adjusted to publish release Docker container images to Dockerhub (under https://hub.docker.com/u/wikibase).
