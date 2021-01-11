#!/bin/bash
set -e

if [ -z $RELEASE_HOST ] || \
[ -z $RELEASE_VERSION ] || \
[ -z $RELEASE_SSH_IDENTITY ] || \
[ -z $RELEASE_MAJOR_VERSION ] || \
[ -z $RELEASE_USER ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

ARTIFACT_PATH=/extractedArtifacts/BuildArtifacts
RELEASE_FULL_PATH=$RELEASE_DIR/$RELEASE_MAJOR_VERSION

# Setup ssh-keys
cp -R /ssh-keys/ /root/.ssh
chmod 700 /root/.ssh

# sign in
eval `ssh-agent -s`
ssh-add /root/.ssh/$RELEASE_SSH_IDENTITY

# create dir
ssh $RELEASE_USER@$RELEASE_HOST mkdir -p $RELEASE_FULL_PATH

# move to uploads with release tag
cp $ARTIFACT_PATH/Wikibase.tar.gz /uploads/wikibase.$RELEASE_VERSION.tar.gz
cp $ARTIFACT_PATH/wdqs-ui.tar.gz /uploads/wdqs-ui.$RELEASE_VERSION.tar.gz

echo "Start uploading tarballs to $RELEASE_FULL_PATH"

# upload
scp /uploads/* $RELEASE_USER@$RELEASE_HOST:$RELEASE_FULL_PATH

# review dir contents
ssh $RELEASE_USER@$RELEASE_HOST ls -ash $RELEASE_FULL_PATH

# remove identity
ssh-add -d
