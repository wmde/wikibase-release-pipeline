# 6) Pipeline runner {#adr_0006}

Date: 2020-12-14

## Status

accepted

## Context

A decision needs to be made on where the pipeline should be executed. The initial prototype has been built using [Github] Actions for it's ease of use and made it possible to quickly set up a repository and full access to a framework that allows us to execute our build steps, testing and publish artifacts. To this day very few technical downsides has been identified by using github to run the pipeline.

As there is a desire to run the pipeline on Wikimedia Foundation's infrastructure an investigation into the possibility to use [PipelineLib] has concluded some drawbacks that makes this a less ideal candidate. [PipelineLib] is backed by [Blubber] which is a piece of software for generating opinionated Dockerfiles that are suited to run tests on and eventually end up in a production environment.

Limitations of PipelineLib and Blubber include:

- Does currently not support publishing tarballs (could potentially be done by injecting jenkins credentials that publish in a separate container)
- Does not support using base images other than those on docker-registry.wikimedia.org
- [Blubber] does not provide root access inside the container
- Does not support docker-in-docker with the builder container having access to the host docker daemon.
- Mainly supporting ubuntu-flavoured image building (apt is not a thing in alpine)

Using WMF's Jenkins has also been considered as an alternative to WMF's PipelineLib for building non-docker artefacts.

Another option would be running the pipeline on a WMDE controlled [Toolforge] VPS with some kind of CI framework or an even simpler implementation for triggering the pipeline to start. If this release process should be fully automated, some additional mechanism would then also be required to move the artifacts to the desired hosting server.

Some key properties of considered options are summarized in the table below:

| Infrastructure | Owner/Provider | Cost of introduction | Cost of maintenance | Trusted and Secure? | WMDE can modify/update | Has some native tooling for docker images | Has some way to build non-docker artifacts | Restriction on the source of software run on the infrastructure? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Github | Github/Microsoft | low | low | no (1) | yes | yes | yes | none, everything from the internet that can be run in a container? |
| PipelineLib | WMF | medium-high (2) | medium (3) | yes | yes but with limitations (4) | yes | no (right now) | Only things hosted somewhere on WMF infrastructure (gerrit, phabricator diffusion, etc). Does not support using base images other than those on docker-registry.wikimedia.org. Mainly supporting ubuntu-flavoured image building (apt is not a thing in alpine) |
| Wikimedia Jenkins | WMF | medium-high | medium | yes | yes but with limitations (4) | no | yes | Only things hosted somewhere on WMF infrastructure (gerrit, phabricator diffusion, etc) |
| some WMDE infrastructure (5) | WMDE | high (6) | medium-high | yes | yes | no | yes | none, everything from the internet that can be run in a container? |

1. Not a complete random vendor but a third party
2. Will likely be different from existing WMF things, there will require some effort and negotiations with the WMF
3. Per likely difference from existing WMF infrastructure, there will be an effort required to maintained WMDE's "custom" elements
4. It is to be expected that WMDE staff will have limited permissions and will to a degree rely on WMF staff
5. e.g. running some custom solution on a VPS or containerised infrastructure either from a commercial provider or on Wikimedia Cloud Services
6. Even though we would expect WMDE office IT help, and/or use the specilalized service provider, there would be significant effort on WMDE Engineering team to set up all elements of infrastructure

## Decision

As the infrastructure that is already existing, and has the least technical limitations, Github Actions will be used to run Wikibase release pipeline. To minimize binding to a specific infrastructure, Wikibase release pipeline will be implemented as a set of Docker container images, intended to be run on the end infrastructure.

## Consequences

WMDE will continue running Wikibase release pipeline on Github Actions but will replace the proof of concept implementation with a container-based more abstract solution. Technical solution ensuring the integrity of packages generated on the third-party infrastructure will be introduced. Process of actual publishing release artifacts to final locations will be defined separately. It is considered that the final step might happen from WMDE infrastructure.

[Github]: https://docs.github.com/en/free-pro-team@latest/actions
[PipelineLib]: https://wikitech.wikimedia.org/wiki/PipelineLib
[Blubber]: https://wikitech.wikimedia.org/wiki/Blubber
[Toolforge]: https://wikitech.wikimedia.org/wiki/Portal:Toolforge
