#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
# set -x

image_name=$1

semver_major="${WIKIBASE_SUITE_RELEASE_MAJOR_VERSION}"
semver_minor="${WIKIBASE_SUITE_RELEASE_MINOR_VERSION}"
semver_patch="${WIKIBASE_SUITE_RELEASE_PATCH_VERSION}"
semver_prerelease="${WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION}"

revision="${GIT_REVISION_HASH}"
branch="${GIT_REVISION_BRANCH}"
timestamp="${BUILD_TIMESTAMP}"
build="build-${revision}-${timestamp}-${branch}"


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
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_${build}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_${build}"

else
    # this is a prerelease, do not tag the partial versions, we do not want
    # prereleases to be pulled as an update to non prerelease versions

    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_${build}"
    docker tag "${image_name}" \
        "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_${build}"
fi

