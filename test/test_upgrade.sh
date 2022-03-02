#!/bin/bash
# shellcheck disable=SC1091,SC1090,SC2086
set -e

cd test
mkdir -p log

ENV_VERSION=$1
TO_VERSION=$2

if [ -z "$TO_VERSION" ]; then
    echo "TO_VERSION is not set"
    exit 1
fi

if [ ! -f "../$TO_VERSION" ]; then
    echo "TO_VERSION does not exist"
    exit 1
fi

WIKIBASE_TEST_CONTAINER=test_wikibase_1
DEFAULT_SUITE_CONFIG="-f docker-compose.upgrade.yml"

set -o allexport; source upgrade/default_variables.env; source "upgrade/old-versions/$ENV_VERSION.env"; source "../$TO_VERSION" set +o allexport

# old wikibase version
export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_SOURCE_IMAGE_NAME"
export SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

# If WDQS is specified append that yml file to SUITE_CONFIG
if [ -n "$WDQS_SOURCE_IMAGE_NAME" ]; then
    export WDQS_TEST_IMAGE_NAME="$WDQS_SOURCE_IMAGE_NAME"
    export SUITE_CONFIG="${DEFAULT_SUITE_CONFIG} -f docker-compose.upgrade.wdqs.yml"
    export RUN_QUERYSERVICE_POST_UPGRADE_TEST="true"
fi

# start the old version & write logs
docker-compose $SUITE_CONFIG up -d
docker-compose $SUITE_CONFIG logs -f --no-color > "log/wikibase.pre.upgrade.$ENV_VERSION.log" &

# wait for it to startup
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

## build selenium test container
docker-compose \
    $SUITE_CONFIG \
    -f docker-compose-selenium-test.yml \
    build \
    --build-arg SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES="$SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES" \
    wikibase-selenium-test

# Run pre_upgrade suite
docker-compose \
    $SUITE_CONFIG \
    -f docker-compose-selenium-test.yml \
    run \
    -e SUITE=pre_upgrade \
    wikibase-selenium-test npm run test:run

# the entrypoint logic is always depending on LocalSettings.php to be there
# since it's now mounted per default it gets removed when the container changes.
# copy the one from the pipeline and run envsubst in this shell
TMP_DIR="$(mktemp -d)"
TMP_LOCALSETTINGS="$TMP_DIR/LocalSettings.php"

# Source the default env vars used for building and create a new LocalSettings file 
set -o allexport; source ../Docker/build/Wikibase/default.env; set +o allexport
envsubst < "../Docker/build/Wikibase/$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" > "$TMP_LOCALSETTINGS"
export TMP_LOCALSETTINGS

# docker-compose down to simulate upgrade
docker-compose $SUITE_CONFIG down

# allow overriding target
if [ -z "$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME" ]; then
    export TARGET_WIKIBASE_UPGRADE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME"
fi

export WIKIBASE_TEST_IMAGE_NAME="$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME:latest";
echo "Target WIKIBASE_TEST_IMAGE_NAME is set to $WIKIBASE_TEST_IMAGE_NAME"

if [ -n "$WDQS_SOURCE_IMAGE_NAME" ]; then
    export WDQS_TEST_IMAGE_NAME="$WDQS_IMAGE_NAME:latest";
    docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
fi

# load new version and start it 
docker load -i "../artifacts/$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME.docker.tar.gz"
docker-compose $SUITE_CONFIG -f upgrade/docker-compose.override.yml up -d
docker-compose $SUITE_CONFIG logs -f --no-color > "log/wikibase.post.upgrade.$ENV_VERSION.log" &

# run update.php and log to separate file
UPGRADE_LOG_FILE="log/wikibase.upgrade.$ENV_VERSION.log"
docker exec "$WIKIBASE_TEST_CONTAINER" php /var/www/html/maintenance/update.php --quick > "$UPGRADE_LOG_FILE"

# Run post_upgrade suite
docker-compose \
    $SUITE_CONFIG \
    -f docker-compose-selenium-test.yml \
    run \
    -e SUITE=post_upgrade \
    wikibase-selenium-test npm run test:run