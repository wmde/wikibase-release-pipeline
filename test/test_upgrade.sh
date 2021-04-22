#!/bin/bash
# shellcheck disable=SC1091,SC1090
set -e

cd test

mkdir -p log

ENV_VERSION=$1
WIKIBASE_TEST_CONTAINER=test_wikibase_1

set -o allexport; source upgrade/default_variables.env; source "upgrade/old-versions/$ENV_VERSION.env"; set +o allexport

# old version
export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_SOURCE_IMAGE_NAME"

# start the old version
docker-compose -f docker-compose.upgrade.yml up -d
# write logs
docker-compose -f docker-compose.upgrade.yml logs -f --no-color > "log/wikibase.upgrade.$ENV_VERSION.log" &

# wait for it to startup
docker-compose -f docker-compose.upgrade.yml -f docker-compose-curl-test.yml build wikibase-test
docker-compose -f docker-compose.upgrade.yml -f docker-compose-curl-test.yml run wikibase-test

## build selenium test container
docker-compose \
    -f docker-compose.upgrade.yml \
    -f docker-compose-selenium-test.yml \
    build \
    --build-arg SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES="$SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES" \
    wikibase-selenium-test

# run tests specified by upgrade/default_variables.env
docker-compose \
    -f docker-compose.upgrade.yml \
    -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run test:run

# the entrypoint logic is always depending on LocalSettings.php to be there
# since it's now mounted per default it gets removed when the container changes.
# copy the one from the pipeline
TMP_DIR="$(mktemp -d)"
TMP_LOCALSETTINGS="$TMP_DIR/LocalSettings.php"
export TMP_LOCALSETTINGS
envsubst < ../Docker/build/Wikibase/LocalSettings.php.template > "$TMP_LOCALSETTINGS"

# docker-compose down to simulate upgrade
docker-compose -f docker-compose.upgrade.yml down

# set new version and start it up
export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_IMAGE_NAME:latest"
docker load -i "../artifacts/$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker-compose -f docker-compose.upgrade.yml -f upgrade/docker-compose.override.yml up -d

# run update.php
docker exec "$WIKIBASE_TEST_CONTAINER" php /var/www/html/maintenance/update.php --quick

# run the tests again
docker-compose \
    -f docker-compose.upgrade.yml \
    -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run test:run