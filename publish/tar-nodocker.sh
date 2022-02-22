#!/bin/bash
set -e

if [ -z "$RELEASE_HOST" ] || \
[ -z "$RELEASE_VERSION" ] || \
[ -z "$RELEASE_MAJOR_VERSION" ] || \
[ -z "$WMDE_RELEASE_VERSION" ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

ARTIFACT_PATH=./artifacts/$WORKFLOW_RUN_NUMBER/BuildArtifacts
RELEASE_FULL_PATH=$RELEASE_DIR/$RELEASE_MAJOR_VERSION

echo "Will upload tarballs from $ARTIFACT_PATH to $RELEASE_HOST at $RELEASE_FULL_PATH"

# move to uploads with release tag
TMP_UPLOAD_PATH=/tmp/wb-rel-pipe/$WORKFLOW_RUN_NUMBER
rm -rf "$TMP_UPLOAD_PATH"
mkdir -p "$TMP_UPLOAD_PATH"
cp "$ARTIFACT_PATH"/Wikibase.tar.gz "$TMP_UPLOAD_PATH"/wikibase."$RELEASE_VERSION"-"$WMDE_RELEASE_VERSION".tar.gz
cp "$ARTIFACT_PATH"/wdqs-frontend.tar.gz "$TMP_UPLOAD_PATH"/wdqs-frontend."$WMDE_RELEASE_VERSION".tar.gz

if [ -z "$DRY_RUN" ]; then
    # create dir
    ssh "$RELEASE_HOST" mkdir -p "$RELEASE_FULL_PATH"

    # upload
    scp "$TMP_UPLOAD_PATH"/* "$RELEASE_HOST":"$RELEASE_FULL_PATH"

    # create dir
    # 22-02-2022 This sis not work for Adam, but also the permissions were fine?
    #ssh "$RELEASE_HOST" chmod -R g+w "$RELEASE_FULL_PATH"
    #ssh "$RELEASE_HOST" chgrp -R releasers-wikibase "$RELEASE_FULL_PATH"

    # review dir contents
    ssh "$RELEASE_HOST" ls -ash "$RELEASE_FULL_PATH"
else
    echo "DRY RUN! Not uploading anything."
    ssh "$RELEASE_HOST" ls -ash "$RELEASE_DIR"
fi
