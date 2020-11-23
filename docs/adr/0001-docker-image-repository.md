# N) Repository for docker images {#adr_0001}

Date: 2020-11-20

## Status

proposed

## Context

Currently the Wikibase docker images are built on travis and deployed to Dockerhub.

There are a number of existing docker repositories we could consider to host our images. We need not pick only one repository but for the purposes of documentaion and clarity we probably want a single canonical one then other repositories could then be "syndicated" from the canonical one.

Some key properties of existing registries were considered in the table below:

| Repository                | Free to WMDE                  | Self-Service (1)            | Built in pipeline                                                                                  | Visibility of built images  (2) | Possibility of replication to repository |
| ------------------------- | ------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------- |
| Dockerhub                 | Currently (soon to change)      | Yes                     | Static builds from dockerfile                                                                      | High                       | Yes                                      |
| Github Container registry | Currently                       | Yes                     | Github Actions                                                                                     | Medium                     | Yes                                      |
| Google Container Registry | No (pay for storage and egress) | Yes                     | Google Cloud                                                                                       | Medium                     | Yes                                      |
| AWS Container registry    | No (pay for storage and egress) | Yes                     | Amazon Cloud                                                                                       | Medium                     | Yes                                      |
| Azure Container Registry  | No (some complex structure)     | Yes                     | Azure Container Registry Tasks                                                                     | Medium                     | Yes                                      |
| WMF Docker Registry       | Yes                             | No (negotiation needed) | [https://wikitech.wikimedia.org/wiki/PipelineLib](https://wikitech.wikimedia.org/wiki/PipelineLib) | Low                        | No (probably not)                        |

1. We can create new images and names without filing a ticket for speaking to people
2. Approximate fraction of the market of docker pulls that happens here

## Decision

...

## Consequences

...
