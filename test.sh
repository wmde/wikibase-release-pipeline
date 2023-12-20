#!/usr/bin/env bash

source ./test/scripts/testRunnerSetup.sh

# Run as DEBUG=true ./test.sh <suiteName> to see logging of the Docker run
optional_debug_output() {
	if [ -n "$DEBUG" ]; then
		"$@"
	else
		"$@" > /dev/null 2>&1
	fi
}

function stop_test_runner {
	optional_debug_output $TEST_RUNNER_COMPOSE down
}

# ./test.sh <suiteName> --setup
# Starts the test environment and leaves it running, but does not run any specs
if ! [ "$2" = "--setup" ]; then
	trap stop_test_runner EXIT
fi

stop_test_runner

optional_debug_output $TEST_RUNNER_COMPOSE up -d --build

$TEST_RUNNER_COMPOSE run --rm test-runner -c "npx ts-node cli.ts ${*:1}"
