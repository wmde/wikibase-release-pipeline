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
[ -z "$WMDE_RELEASE_VERSION" ] || \
[ -z "$METADATA_WDQS_FRONTEND_COMMIT_HASH" ] || \
[ -z "$METADATA_WIKIBASE_COMMIT_HASH" ] || \
[ -z "$METADATA_WIKIBASEMANIFEST_COMMIT_HASH" ] || \
[ -z "$WORKFLOW_RUN_NUMBER" ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

function echo_tag {
    COMMIT_HASH=$1
    REPO_NAME=$2
    echo
    echo "Use the following tag on $REPO_NAME"
    echo "git tag --force -a \"$WMDE_RELEASE_VERSION\" \"$COMMIT_HASH\" -m \"Tagging: $WMDE_RELEASE_VERSION Build: $WORKFLOW_RUN_NUMBER\""
    echo
}

# tag and push Wikibase
echo_tag "$METADATA_WIKIBASE_COMMIT_HASH" "Wikibase"

# tag and push wdqs-frontend
echo_tag "$METADATA_WDQS_FRONTEND_COMMIT_HASH" "WDQS frontend"

# tag and push WikibaseManifest
echo_tag "$METADATA_WIKIBASEMANIFEST_COMMIT_HASH" "Wikibase Manifest"
