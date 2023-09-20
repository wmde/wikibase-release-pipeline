#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
# set -x

image_name=$1
semver_major=$2
semver_minor=$3
semver_patch=$4
semver_prerelease=$5

semver_build=${GIT_REVISION_HASH}

if [[ -z "${semver_prerelease}" ]]; then
    # this is not a prerelease, do the full tagging

    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}"

    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}"

    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}"

    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_rev-${semver_build}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_rev-${semver_build}"

else
    # this is a prerelease, do not tag the partial versions, we do not want
    # prereleases to be pulled as an update to non prerelease versions
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_rev-${semver_build}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_rev-${semver_build}"
fi

