#!/usr/bin/env bash
set -e

if [ -z "$WDQS_DOCKER_PATH" ] || \
[ -z "$WDQS_FRONTEND_DOCKER_PATH" ] || \
[ -z "$WIKIBASE_DOCKER_PATH" ] || \
[ -z "$WIKIBASE_BUNDLE_DOCKER_PATH" ] || \
[ -z "$ELASTICSEARCH_DOCKER_PATH" ] || \
[ -z "$QUICKSTATEMENTS_DOCKER_PATH" ] || \
[ -z "$WDQS_PROXY_DOCKER_PATH" ] || \
\
[ -z "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_WDQS_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_WIKIBASE_BUNDLE_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL" ] || \
[ -z "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL" ] || \
\
[ -z "$RELEASE_VERSION" ] || \
[ -z "$WMDE_RELEASE_VERSION" ] || \
[ -z "$WDQS_VERSION" ] || \
[ -z "$ELASTICSEARCH_VERSION" ] || \
\
[ -z "$DOCKER_HUB_ID" ] || \
[ -z "$DOCKER_HUB_REPOSITORY_NAME" ] || \
[ -z "$DOCKER_HUB_ACCESS_TOKEN" ] ; then
    echo "A variable is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
fi

function tag_and_push {
    IMAGE_NAME=$1
    IMAGE_VERSION=$2

    # example: wikibase/wikibase:1.35
    IMAGE_TAG="$DOCKER_HUB_REPOSITORY_NAME/$IMAGE_NAME:$IMAGE_VERSION"

    if [ -z "$DRY_RUN" ]; then
        docker push "$IMAGE_TAG"
    else
        echo "DRY RUN! Not pushing $IMAGE $IMAGE_TAG"
    fi
}

# start and wait for dockerd and set the correct socket
docker --version
sh /usr/local/bin/dockerd-entrypoint.sh dockerd &
export DOCKER_HOST=unix:///run/user/1000/docker.sock
sleep 5

echo 'Start tagging & publishing ...'

# Login
echo "Signing in as $DOCKER_HUB_ID"
echo "$DOCKER_HUB_ACCESS_TOKEN" | docker login --username "$DOCKER_HUB_ID" --password-stdin

# load images
docker load -i "$WIKIBASE_DOCKER_PATH"
docker load -i "$WIKIBASE_BUNDLE_DOCKER_PATH"
docker load -i "$WDQS_DOCKER_PATH"
docker load -i "$WDQS_FRONTEND_DOCKER_PATH"
docker load -i "$ELASTICSEARCH_DOCKER_PATH"
docker load -i "$QUICKSTATEMENTS_DOCKER_PATH"
docker load -i "$WDQS_PROXY_DOCKER_PATH"

# Tag Queryservice Proxy with version
tag_and_push "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL" "$WMDE_RELEASE_VERSION"

# Tag WDQS-frontend with version
tag_and_push "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL" "$WMDE_RELEASE_VERSION"

# Tag WDQS with version
tag_and_push "$WIKIBASE_SUITE_WDQS_IMAGE_URL" "$WDQS_VERSION-$WMDE_RELEASE_VERSION"

# Tag Wikibase with version
tag_and_push "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" "$RELEASE_VERSION-$WMDE_RELEASE_VERSION"

# Tag Wikibase-bundle with version
tag_and_push "$WIKIBASE_SUITE_WIKIBASE_BUNDLE_IMAGE_URL" "$RELEASE_VERSION-$WMDE_RELEASE_VERSION"

# Tag Elasticsearch with version
tag_and_push "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL" "$ELASTICSEARCH_VERSION-$WMDE_RELEASE_VERSION"

# Tag Quickstatements with version
tag_and_push "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL" "$WMDE_RELEASE_VERSION"

# logout and remove credentials 
docker logout
rm /home/rootless/.docker/config.json
