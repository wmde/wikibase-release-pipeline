#!/usr/bin/env bash
# shellcheck disable=SC2086
set -e

export SUITE=$1

# if prepended with base__ we might still want to use the bundle config
if [[ $SUITE == base__* ]] && [ ! -d "suite-config/$SUITE" ] ; then
    SUITE_CONFIG_NAME=${SUITE//base__/}
else
    SUITE_CONFIG_NAME=$SUITE
fi

# set suite localsettings
export LOCALSETTINGS_VARIANT=$SUITE_CONFIG_NAME

if [ ! -d "suite-config/$SUITE_CONFIG_NAME" ]; then
    echo "🚨 Suite $SUITE_CONFIG_NAME does not exist, exiting"  2>&1 | tee -a "$TEST_LOG"
    exit 1
fi

TEST_COMPOSE="docker compose -f docker-compose-selenium-test.yml $DEFAULT_SUITE_CONFIG"
SUITE_OVERRIDE="suite-config/$SUITE_CONFIG_NAME/docker-compose.override.yml"

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "ℹ️  Using docker compose override file $SUITE_OVERRIDE" 2>&1 | tee -a "$TEST_LOG"

    TEST_COMPOSE="$TEST_COMPOSE -f $SUITE_OVERRIDE"
fi

function remove_services_and_volumes {
    $TEST_COMPOSE down --volumes --remove-orphans --timeout 1 >> "$TEST_LOG" 2>&1 || true
}

# shut down the stack if running, remove volumes to start test suite on fresh db
echo "🔄 Removing existing Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes

# create stack
echo "🔄 Creating Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
$TEST_COMPOSE up -d --build --scale wikibase-selenium-test=0 >> "$TEST_LOG" 2>&1
$TEST_COMPOSE logs -f --no-color >> "$TEST_LOG" &
# wait until containers start
# shellcheck disable=SC2016
$TEST_COMPOSE run --rm wikibase-selenium-test -c './scripts/check_if_up.sh $MW_SERVER /wiki/Main_Page'
$TEST_COMPOSE run --rm wikibase-selenium-test -c "[[ -f ./setup.sh ]] && ./setup.sh"

echo -e "\n✳️  Running \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"

WDIO_COMMAND='npm run test:run --silent'
if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi

$TEST_COMPOSE run --rm wikibase-selenium-test -c "$WDIO_COMMAND"

echo -e "🔄 Removing running Docker test services and volumes\n" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes
