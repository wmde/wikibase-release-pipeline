#!/usr/bin/env bash
set -e

export SUITE=$1
# Note: "__base_SUITE" specs use config found in the "SUITE" directory
export SUITE_CONFIG_NAME=${SUITE//base__/}
if [ ! -d "suite-config/$SUITE_CONFIG_NAME" ]; then
    echo "🚨 \"$SUITE\" does not exist, exiting"  2>&1 | tee -a "$TEST_LOG"
    exit 1
fi

TEST_COMPOSE="docker compose -f docker-compose.yml $DEFAULT_SUITE_CONFIG"
# adding Docker compose override file for this suite if there is one
SUITE_OVERRIDE="suite-config/$SUITE_CONFIG_NAME/docker-compose.override.yml"
if [ -f "$SUITE_OVERRIDE" ]; then
    echo "ℹ️  Using $SUITE_OVERRIDE" 2>&1 | tee -a "$TEST_LOG"
    TEST_COMPOSE="$TEST_COMPOSE -f $SUITE_OVERRIDE"
fi

function remove_services_and_volumes {
    $TEST_COMPOSE down --volumes --remove-orphans --timeout 1 >> "$TEST_LOG" 2>&1 || true
}

echo "🔄 Removing existing Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes

echo "🔄 Creating Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
$TEST_COMPOSE up -d --build --scale test-runner=0 >> "$TEST_LOG" 2>&1
$TEST_COMPOSE logs -f --no-color >> "$TEST_LOG" &

# run the global suite setup.sh (waits for containers to come up, etc)
echo "🔄 Running suite-config/setup.sh" 2>&1 | tee -a "$TEST_LOG"
$TEST_COMPOSE run --rm test-runner -c suite-config/setup.sh 2>&1 | tee -a "$TEST_LOG"

echo -e "\n✳️  Running \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"
WDIO_COMMAND='npm run test:run --silent'
if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi
$TEST_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"

echo -e "🔄 \"$SUITE\" test suite run complete. Removing running Docker test services and volumes\n" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes
