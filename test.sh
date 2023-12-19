#!/usr/bin/env bash

set -e

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

cd test

# ./test.sh --shell
# Updates NPM dependencies on test-runner
if [ "$1" = "--npmInstall" ]; then
	DEBUG=true
	NPM_INSTALL=true
fi

# ./test.sh <suiteName> --setup
# Starts the test environment and leaves it running, but does not run any specs
if [ "$2" = "--setup" ]; then
	SETUP=true
fi

TEST_RUNNER_COMPOSE="docker compose -f docker-compose.yml --env-file ./test-runner.env --env-file ../local.env"

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

if ! [ "$SETUP" ]; then
	trap stop_test_runner EXIT
fi

stop_test_runner

optional_debug_output $TEST_RUNNER_COMPOSE up -d --build

if [ "$NPM_INSTALL" ]; then
	$TEST_RUNNER_COMPOSE run --rm test-runner -c "npm install"
else
	$TEST_RUNNER_COMPOSE run --rm test-runner -c "npx ts-node cli.js ${*:1}"
fi


