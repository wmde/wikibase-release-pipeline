#!/bin/sh

docker --version
sh /usr/local/bin/dockerd-entrypoint.sh dockerd &
sleep 5
export DOCKER_HOST=unix:///run/user/1000/docker.sock

docker load -i "$WIKIBASE_DOCKER_PATH"
docker load -i "$QUERYSERVICE_BACKEND_DOCKER_PATH"
docker load -i "$QUERYSERVICE_FRONTEND_DOCKER_PATH"

docker images