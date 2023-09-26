#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
# set -x

function docker_tags() {
    local image_name="$1"
    local semver_major="$2"
    local semver_minor="$3"
    local semver_patch="$4"
    local semver_prerelease="$5"
    local revision="${GIT_REVISION_HASH}"
    local branch="${GIT_REVISION_BRANCH}"
    local timestamp="${BUILD_TIMESTAMP}"

    local build="build-${revision}-${timestamp}-${branch}"

    local list_of_tags

    if [[ -z "${semver_prerelease}" ]]; then
        # this is not a prerelease, do the full tagging

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}"
        list_of_tags+=$'\n'

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}"
        list_of_tags+=$'\n'

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}"
        list_of_tags+=$'\n'

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_${build}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}_${build}"
        list_of_tags+=$'\n'

    else
        # this is a prerelease, do not tag the partial versions, we do not want
        # prereleases to be pulled as an update to non prerelease versions

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}"
        list_of_tags+=$'\n'

        list_of_tags+="${DOCKER_REPOSITORY_NAME}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_${build}"
        list_of_tags+=$'\n'
        list_of_tags+="${DOCKER_REPOSITORY_NAME_WIP}/${image_name}:v${semver_major}.${semver_minor}.${semver_patch}-${semver_prerelease}_${build}"
        list_of_tags+=$'\n'
    fi

    echo "$list_of_tags"
}


