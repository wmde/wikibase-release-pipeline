#!/bin/sh
set -e

function tag_and_push {
	IMAGE_NAME=$1
    IMAGE_VERSION=$2

	IMAGE_TAG="$DOCKER_HUB_REPOSITORY_NAME/$IMAGE_NAME:$IMAGE_VERSION"
    docker tag "$IMAGE_NAME:latest" $IMAGE_TAG
    docker push $IMAGE_TAG
}


# start and wait for dockerd and set the correct socket
docker --version
sh /usr/local/bin/dockerd-entrypoint.sh dockerd &
export DOCKER_HOST=unix:///run/user/1000/docker.sock
sleep 5

echo 'Start tagging & publishing ...'
# Login
echo $TEST_DOCKER_HUB_ACCESS_TOKEN | docker login --username $DOCKER_HUB_ID --password-stdin

# load images
docker load -i "$WIKIBASE_DOCKER_PATH"
docker load -i "$QUERYSERVICE_BACKEND_DOCKER_PATH"
docker load -i "$QUERYSERVICE_FRONTEND_DOCKER_PATH"

# Tag Queryservice UI with version
tag_and_push $QUERYSERVICE_UI_IMAGE_NAME $WIKIBASE_BRANCH_NAME

# Tag Queryservice with version
tag_and_push $QUERYSERVICE_IMAGE_NAME $WIKIBASE_BRANCH_NAME

# Tag Wikibase with version
tag_and_push $WIKIBASE_IMAGE_NAME $WIKIBASE_BRANCH_NAME

# logout and remove credentials 
docker logout
rm /home/rootless/.docker/config.json