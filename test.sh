#!/usr/bin/env bash
set -e
source ./test/scripts/test_runner_setup.sh

if ! [ "$2" = "--setup" ]; then
	trap down_test_runner EXIT
fi

down_test_runner

$TEST_COMPOSE up -d
$RUN_TEST_RUNNER_CMD "npx ts-node cli.ts ${*:1}"
