#!/usr/bin/env bash

set -e

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

cd test

if [ "$2" = "--setup" ]; then
	SETUP=true
fi

TEST_RUNNER_COMPOSE="docker compose -f docker-compose.yml --env-file ./test-runner.env --env-file ../local.env --progress quiet"

function stop_test_runner {
	$TEST_RUNNER_COMPOSE down > /dev/null 2>&1
}

if ! [ "$SETUP" ]; then
	trap stop_test_runner EXIT
fi

stop_test_runner

$TEST_RUNNER_COMPOSE up -d --build > /dev/null 2>&1
$TEST_RUNNER_COMPOSE run --rm test-runner -c "npx ts-node cli.ts ${*:1}"
