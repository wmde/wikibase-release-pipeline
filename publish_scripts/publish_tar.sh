#!/bin/bash

# Check artefacts are there
REQUIRED_VARIABLES=(WIKIBASE_TAR_PATH \
QUERYSERVICE_BACKEND_TAR_PATH \
QUERYSERVICE_FRONTEND_TAR_PATH \
WIKIBASE_DOCKER_PATH \
QUERYSERVICE_BACKEND_DOCKER_PATH \
QUERYSERVICE_FRONTEND_DOCKER_PATH)
for i in ${REQUIRED_VARIABLES[@]}; do
    eval THISSHOULDBESET=\$$i
    if [ -z "$THISSHOULDBESET" ]; then
    echo "$i is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
    fi
done

echo "run git tag version $WIKIBASE_VERSION on"

echo "pushing wikibase tarball from $WIKIBASE_TAR_PATH"
echo "pushing wikibase query service tarball from $QUERYSERVICE_BACKEND_TAR_PATH"
echo "pushing wikibase query service UI tarball from $QUERYSERVICE_FRONTEND_TAR_PATH"