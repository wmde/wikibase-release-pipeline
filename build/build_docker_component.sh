#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

source build/docker_tag.sh

component=$1

echo "🔧 Building $component..."
build/build_"${component}"_docker.sh "$component"

echo "🏷 Tagging $component..."
list_of_tags="$(docker_tags "$component" \
    "$WIKIBASE_SUITE_RELEASE_MAJOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_MINOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PATCH_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION" \
    "$GIT_REVISION_HASH" \
    "$GIT_REVISION_BRANCH" \
    "$BUILD_TIMESTAMP")"

for tag in $list_of_tags; do
    docker tag "$component" "$tag"
done


echo "💾 Saving $component..."

# shellcheck disable=SC2086 # use list_of_tags as multiple params 
docker save \
    "$component" \
    $list_of_tags \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${component}.docker.tar.gz"
