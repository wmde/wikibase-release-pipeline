#!/usr/bin/env bash

set -e

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

cd test

# ./test.sh <suiteName> --setup
# Starts the test environment and leaves it running, but does not run any specs
if [ "$2" = "--setup" ]; then
	SETUP=true
fi

# Explicitly adds the Docker network wikibase-suite-test to shared by both
# test-runner and test-services
docker network create wikibase-suite-test > /dev/null 2>&1 || true

TEST_RUNNER_COMPOSE="docker compose -f docker-compose.yml --env-file ./test-runner.env --env-file ../local.env --progress quiet"

# Run as DEBUG=true ./test.sh <suiteName> to see logging of the Docker run
optional_debug_output() {
	if [ -n "$DEBUG" ]; then
		"$@"
	else
		"$@" > /dev/null 2>&1
	fi
}

function stop_test_runner {
	optional_debug_output "$TEST_RUNNER_COMPOSE" down
}

if ! [ "$SETUP" ]; then
	trap stop_test_runner EXIT
fi

stop_test_runner

optional_debug_output "$TEST_RUNNER_COMPOSE" up -d --build

$TEST_RUNNER_COMPOSE run --rm test-runner -c "npx ts-node cli.ts ${*:1}"
