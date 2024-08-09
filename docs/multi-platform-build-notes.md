# Multi-platform builds

## Current testing

A build of all images to multi-platform using QEMU on an Herzner VPS (AMD64, 8 VCPU, 16 GB) running 7 self-hosted GitHub Action runners (only because of the current Phabricator repo locked-out due to rate limiting): https://github.com/wmde/wikibase-release-pipeline/actions/runs/10318403871. Completed successfully and tested for Wikibase (pulled and ran localy both for a AMD an ARM environment. I got the approprate build in each environment, and they both ran as expected. The total build time for all images building in parallel was about 57 Mins. In my estimate based on the performance of the less complex multi-platform builds (ElasticSearch, WDQS-Proxy) which don't have any compilation, I think this will be about 10+ mins faster in total using the standard AMD64 GitHub Action runners and QEMU. In conclusion, we may be already ready to turn on multi-platform builds once we agree to a testing strategy.

*To try to build multi-platform just add `--platform linux/amd64,linux/arm64` to the arguments for `nx build` locally or in `.github/_build_test.yml` if trying on CI. The builder and QEMU setup is already there in the GitHub actions world.*

## Setting up the multi platform builders and building (WIP)

There are at least 2 options:

- Building on two different machines using a master builder: https://chatgpt.com/share/8343a211-505e-49a4-9d05-260de2631944. The setup looks a bit like the code below. This essentially would allow us to keep using GitHub runners as we are with a single remote ARM builder instance and otherwise our build scripts/commands would be mostly the same as they are with the addition of `--platform linux/amd64,linux/arm64`. I think that would be ideal [LEJ 2024-08-09]

- Do it more manually and assemble the images with `docker buildx imagetools create`: [Notes here and below](https://github.com/docker/build-push-action/issues/671#issuecomment-1609106171) consider building and test on each platform independently, and then in the publish step using `docker buildx imagetools create` to assemble the multi-platform release (at the same time as release tagging). It is nice and explicit, but it also means making code for things that Docker has tried to provide for us, and generally I think it would be better to not have to manually manage push/pulling the images to/from a repository to share with the master builder so I prefer the first option if it works well though.

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

## Other notes

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
