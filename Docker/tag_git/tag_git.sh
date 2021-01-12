#!/bin/bash

# contains the commit hashes
BUILD_METADATA_ENV_FILE=/extractedArtifacts/BuildMetadata/build_metadata.env

if [ ! -f $BUILD_METADATA_FILE ]; then
    echo "This build does not contain a metadata file!"
    exit 1
fi

source $BUILD_METADATA_ENV_FILE

if [ -z $WIKIBASE_BRANCH_NAME ] || \
[ -z $RELEASE_VERSION ] || \
[ -z $WIKIBASE_COMMIT_HASH ] || \
[ -z $WORKFLOW_RUN_NUMBER ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

git clone --single-branch --branch ${WIKIBASE_BRANCH_NAME} "/git_cache/Wikibase.git" "/repo/Wikibase"
cd /repo/Wikibase

echo "Tagging $RELEASE_VERSION at $WIKIBASE_COMMIT_HASH"
git tag -a $RELEASE_VERSION $WIKIBASE_COMMIT_HASH -m "Tagging: $RELEASE_VERSION Build: $WORKFLOW_RUN_NUMBER"

# set remote
# push origin