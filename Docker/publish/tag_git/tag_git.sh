#!/bin/bash

set -e

# source all metadata files
for file in  /extractedArtifacts/BuildMetadata/build_metadata_*.env ; do
  if [ -f "$file" ] ; then
    # shellcheck disable=SC1090
    . "$file"
  fi
done

if [ -z "$WIKIBASE_BRANCH_NAME" ] || \
[ -z "$RELEASE_VERSION" ] || \
[ -z "$METADATA_WDQS_UI_COMMIT_HASH" ] || \
[ -z "$METADATA_WIKIBASE_COMMIT_HASH" ] || \
[ -z "$WORKFLOW_RUN_NUMBER" ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

function tag_and_push {
    REPOSITORY_CACHE_NAME=$1
    CHECKOUT_DIR=$2
    BRANCH_NAME=$3
    COMMIT_HASH=$4
    REMOTE_URL=$5

    git clone --single-branch --branch "${BRANCH_NAME}" "$REPOSITORY_CACHE_NAME" "$CHECKOUT_DIR"
    cd "$CHECKOUT_DIR"

    echo "Tagging $RELEASE_VERSION at $COMMIT_HASH"
    git tag --force -a "$RELEASE_VERSION" "$COMMIT_HASH" -m "Tagging: $RELEASE_VERSION Build: $WORKFLOW_RUN_NUMBER"

    if [ -z "$DRY_RUN" ]; then
        git remote set-url origin "$REMOTE_URL"
        git push --tags
    else
        echo "DRY RUN! Not pushing anything"
    fi

    cd -
}

# tag and push Wikibase
tag_and_push "/git_cache/Wikibase.git" \
    "/repo/Wikibase" \
    "$WIKIBASE_BRANCH_NAME" \
    "$METADATA_WIKIBASE_COMMIT_HASH" \
    ssh://gerrit.wikimedia.org:29418/mediawiki/extensions/Wikibase

# tag and push queryservice ui
tag_and_push "/git_cache/services/wikidata-query-gui.git" \
    "/repo/wdqs-frontend" \
    master \
    "$METADATA_WDQS_UI_COMMIT_HASH" \
    ssh://gerrit.wikimedia.org:29418/wikidata/query/gui