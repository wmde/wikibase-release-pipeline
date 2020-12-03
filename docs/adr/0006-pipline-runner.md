# 6) Pipeline runner {#adr_0006}

Date: 2020-12-03

## Status

proposed

## Context

A decision needs to be made on where the pipeline should be executed. The initial prototype has been built using Github Actions for it's ease of use and made it possible to quickly set up a repository and full access to a framework that allows us to execute our build steps. During this process other possibilities has also been explored.

As there is a desire to run the pipeline on foundation infrastructure an investigation into the possibility to use [PipelineLib] has concluded some drawbacks that makes this a less ideal candidate.

- Does currently not support publishing tarballs (could potentially be done by injecting jenkins credentials that publish in a separate container)
- Does not support using base images other than those on docker-registry.wikimedia.org
- Blubber does not provide root access inside the container
- Does not support docker-in-docker with the builder container having access to the host docker daemon.
- Mainly supporting ubuntu-flavoured image building (apt is not a thing in alpine)

## Decision



## Consequences



[PipelineLib]: https://wikitech.wikimedia.org/wiki/PipelineLib
