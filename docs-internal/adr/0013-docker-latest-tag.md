# 13) Docker latest tag {#adr_0013}

Date: 2021-05-27

## Status

accepted

## Context

Docker allows tags to be defined for the images in a docker repository. The default tag that is used unless anything else is specified is the ["latest"](https://docs.docker.com/engine/reference/commandline/tag/#tag-an-image-referenced-by-name) tag. This goes both for publishing and pulling images, unless anything else is specified you get "latest".

Previously the wikibase repository has shipped `wikibase/wikibase` images with three different latest tags depending on the flavor of wikibase.

- latest-bundle
- latest-base
- latest (seems to be the base)

There are many arguments being presented against using "latest" when running docker images[[1]](https://vsupalov.com/docker-latest-tag/)[[2]](https://blog.container-solutions.com/docker-latest-confusion). It comes with an uncertainty of what image we are actually getting, as latest does not necessarily mean the last image uploaded or the latest version but rather just the image tagged as "latest". It sort of serves as an easy and rather uninformed way of choosing what version to run.

On the other hand it is also a common concept in docker and on dockerhub.

As an example for [kubernetesui](https://hub.docker.com/r/kubernetesui/dashboard) they have decided not to publish a latest tag but the suggested download method on dockerhub is still presented as:

```
docker pull kubernetesui/dashboard
```

Running this example:

```
$ docker pull kubernetesui/dashboard
Using default tag: latest
Error response from daemon: manifest for kubernetesui/dashboard:latest not found: manifest unknown: manifest unknown
```

Which when issued results in nothing being pulled because of the missing latest tag. This might seem like a sloppy mistake but probably a very concious decision as kubernetes [tends to pull the images every time the images are used](https://kubernetes.io/docs/concepts/containers/images/#updating-images).

In most cases for wikibase automatically getting a new version from the "latest" tag would put the instance in a state where a manual update would be required.

As per previous discussions during the hike, one downside of making everything "too" easy to get up and running is that the end-users aren't fully aware what they are running or why they would need it. Therefore producing the latest tag seems like a easy thing to skip in order to avoid these kind of accidental selections and forcing the decision to be made by the user.

## Decision

- Do not publish a latest tag for now

## Consequences

- Remove any current latest / latest-base / latest-bundle tags for all images
- Have some kind of text for each image on dockerhub that describes that we do not supply a latest tag and that the user should select one based on the version number.
