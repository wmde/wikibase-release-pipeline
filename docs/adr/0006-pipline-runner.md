# 6) Pipeline runner {#adr_0006}

Date: 2020-12-03

## Status

proposed

## Context

A decision needs to be made on where the pipeline should be executed. The initial prototype has been built using [Github] Actions for it's ease of use and made it possible to quickly set up a repository and full access to a framework that allows us to execute our build steps, testing and publish artifacts. To this day very few technical downsides has been identified by using github to run the pipeline. However there are also strong political arguments against using github since their terms of service conflicts with the goals of the foundations, as github is currently not available to everyone based on [sanctions] enforced by U.S. trade restrictions.

As there is a desire to run the pipeline on foundation infrastructure an investigation into the possibility to use [PipelineLib] has concluded some drawbacks that makes this a less ideal candidate. [PipelineLib] is backed by [Blubber] which is a piece of software for generating opinionated Dockerfiles that are suited to run tests on and eventually end up in a production environment.

- Does currently not support publishing tarballs (could potentially be done by injecting jenkins credentials that publish in a separate container)
- Does not support using base images other than those on docker-registry.wikimedia.org
- [Blubber] does not provide root access inside the container
- Does not support docker-in-docker with the builder container having access to the host docker daemon.
- Mainly supporting ubuntu-flavoured image building (apt is not a thing in alpine)

Another option would be running the pipeline on a WMDE controlled [Toolforge] VPS with some kind of CI framework or an even simpler implementation for triggering the pipeline to start. If this release process should be fully automated, some additional mechanism would then also be required to move the artifacts to the desired hosting server.

## Decision


## Consequences


[Github]: https://docs.github.com/en/free-pro-team@latest/actions
[PipelineLib]: https://wikitech.wikimedia.org/wiki/PipelineLib
[Blubber]: https://wikitech.wikimedia.org/wiki/Blubber
[Toolforge]: https://wikitech.wikimedia.org/wiki/Portal:Toolforge
[sanctions]: https://techcrunch.com/2019/07/29/github-ban-sanctioned-countries/
