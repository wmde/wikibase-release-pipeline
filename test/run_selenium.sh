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

SUITE_OVERRIDE="suite-config/$SUITE_CONFIG_NAME/docker-compose.override.yml"
SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "ℹ️  Using docker compose override file $SUITE_OVERRIDE" 2>&1 | tee -a "$TEST_LOG"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

SUITE_COMPOSE="docker compose $SUITE_CONFIG"
SUITE_AND_TEST_SETUP_COMPOSE="$SUITE_COMPOSE -f docker-compose.test-setup.yml"
SUITE_AND_TEST_RUNNER_COMPOSE="$SUITE_COMPOSE -f docker-compose-selenium-test.yml"

function remove_services_and_volumes {
    $SUITE_AND_TEST_RUNNER_COMPOSE down --volumes --remove-orphans --timeout 1 >> "$TEST_LOG" 2>&1 || true
}

# build test-setup and wikibase-selenium-test just in case something has changed
$SUITE_AND_TEST_SETUP_COMPOSE build test-setup >> $TEST_LOG 2>&1
$SUITE_AND_TEST_RUNNER_COMPOSE build wikibase-selenium-test >> "$TEST_LOG" 2>&1

# shut down the stack if running, remove volumes to start test suite on fresh db
echo "🔄 Removing existing Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes

# create stack
echo "🔄 Creating Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
$SUITE_COMPOSE up -d >> "$TEST_LOG" 2>&1
$SUITE_COMPOSE logs -f --no-color >> "$TEST_LOG" &
# wait until containers start
$SUITE_AND_TEST_SETUP_COMPOSE run --rm test-setup

echo -e "\n✳️  Running \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"

WDIO_COMMAND='npm run test:run --silent'
if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi

$SUITE_AND_TEST_RUNNER_COMPOSE run --rm wikibase-selenium-test bash -c "$WDIO_COMMAND"

echo -e "🔄 Removing running Docker test services and volumes\n" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes
