#!/bin/bash

# Check artefacts are there
REQUIRED_VARIABLES=(WIKIBASE_DOCKER_PATH \
QUERYSERVICE_BACKEND_DOCKER_PATH \
QUERYSERVICE_FRONTEND_DOCKER_PATH)
for i in ${REQUIRED_VARIABLES[@]}; do
    eval THISSHOULDBESET=\$$i
    if [ -z "$THISSHOULDBESET" ]; then
    echo "$i is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
    fi
done

echo "adding correct tags to images"

echo "pushing wikibase docker image from $WIKIBASE_DOCKER_PATH"
echo "pushing wikibase query service docker image from $QUERYSERVICE_BACKEND_DOCKER_PATH"
echo "pushing wikibase query service UI docker image from $QUERYSERVICE_FRONTEND_DOCKER_PATH"