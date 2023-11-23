#!/usr/bin/env bash

set -e
trap stop_test_runner EXIT
cd test

TEST_RUNNER_COMPOSE="\
docker compose \
-f docker-compose.yml
--env-file ../variables.env \
--env-file default.env \
--env-file ../local.env \
--progress quiet\
"

function test_suite {
	SUITE_NAME=$1
	WDIO_OPTIONS=$2

	WDIO_COMMAND="npx wdio suites/$SUITE_NAME/$SUITE_NAME.conf.ts --silent"

	if [ -n "$WDIO_OPTIONS" ]; then
		WDIO_COMMAND="$WDIO_COMMAND $WDIO_OPTIONS"
	fi

	$TEST_RUNNER_COMPOSE up -d --build --scale test-runner=0 > /dev/null 2>&1
	$TEST_RUNNER_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"
	stop_test_runner
}

function stop_test_runner {
	$TEST_RUNNER_COMPOSE down --volumes > /dev/null 2>&1
}

function test_all_suites {
	printf "\n⚠️  Running All Test Suites\n"

	# bundle tests
	test_suite repo
	test_suite fedprops
	test_suite repo_client
	test_suite quickstatements
	test_suite pingback
	test_suite confirm_edit
	test_suite elasticsearch

	# base tests
	test_suite base__repo
	test_suite base__repo_client
	test_suite base__fedprops
	test_suite base__pingback
}

WDIO_OPTIONS="${*:2}"

if [ -z "$1" ]
then
	test_all_suites
else
	test_suite "$1" "${*:2}"
fi
