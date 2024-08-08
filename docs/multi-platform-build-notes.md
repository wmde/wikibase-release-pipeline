# Multi-platform builds

Current build times using QEMU emulation on the Github runner for everything but Wikibase is < 15 minutes, so we may be able to get by with QEMU emulation after all: https://github.com/wmde/wikibase-release-pipeline/actions/runs/10296671817

Unfortunately Wikibase didn't build in the above run because of rate limiting from MediaWiki, so we don't yet know the build time on that. Last time I tried it timed out the Action run which was set to 30 mins. I suspect it will build in 40-70 mins based on the relative performance of the other builds.


Some things to try:

- [ ] Apply and test $BUILDPLATFORM and $TARGETPLATFORM to Wikibase Dockerfile to potentially speed-up build somewhat, e.g.:

```
ARG TARGETPLATFORM
ARG BUILDPLATFORM
...
FROM --platform=$BUILDPLATFORM ${COMPOSER_IMAGE_URL} as composer
...
```

This should work given that we only copy from Composer in the final image. See https://docs.docker.com/build/building/multi-platform/#cross-compilation. Also note that those PLATFORM args don't have a default when not doing a multi-platform build, so setting them manually may be necessary when using single platform builds.

- [ ] 

# Setting-up a local repository for storing/testing multi-platform builds 

Ref. https://www.luu.io/posts/multi-platform-docker-image:

1. `docker buildx create --name mybuilder --bootstrap --platform linux/amd64,linux/arm64 --use --config mybuilderconfig.toml` \*
2. `docker run -d -p 5000:5000 --name registry registry`
3. `docker buildx build . --platform=linux/amd64,linux/arm64 --push --tag localhost:5000/wikibase/wbs-dev-runner:latest`


# Setting up the multi platform builders and building (WIP)

```

#!/bin/bash

# Create and configure builders for each platform
docker buildx create --name builder-arm64 --platform linux/arm64
docker buildx create --name builder-amd64 --platform linux/amd64

# Create a multi-builder that includes both platform-specific builders
docker buildx create --name multi-builder --driver docker-container --use
docker buildx create --append --name multi-builder --platform linux/arm64 --node builder-arm64
docker buildx create --append --name multi-builder --platform linux/amd64 --node builder-amd64

# Run docker buildx bake for the multi-platform build (normal buildx build is fine too...)
docker buildx bake --progress=plain
```
