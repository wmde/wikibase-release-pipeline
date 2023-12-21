#!/usr/bin/env bash

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

# Explicitly adds the Docker network wikibase-suite-test which is shared by both
# test runner and test services
docker network inspect wikibase-suite-test > /dev/null 2>&1 || \
  docker network create wikibase-suite-test > /dev/null

# on `test-runner` `node_modules`` is set to persist in a bind-mounted volume
# pointing to `test/node_modules`. This allows visibility of the modules in the
# dev environment making things like autocomplete/intellisense work as well as
# the expected place to go to look over code in our dependencies when debugging.
# However, because of this setup we have to make sure that the `test/node_modules`
# directory always exists before Docker runs or it will fail with an error.
mkdir -p test/node_modules

# The test runner is currently configured and ran through `test/docker-compose.yml
# this is the set of docker compose CLI params that should always be used when
# running it. Note that this compose command assumes it is ran from the root
# directory of the project, not from within the `test` directory.
export TEST_RUNNER_COMPOSE="docker compose \
-f test/docker-compose.yml \
--env-file test/test-runner.env \
--env-file local.env \
--project-directory test"

# Run as "DEBUG=true <script>" to see logging of Docker operations
if [ -z "$DEBUG" ]; then
	TEST_RUNNER_COMPOSE="$TEST_RUNNER_COMPOSE --progress quiet"
fi

# Run as ",/<script>.sh --shell" to break out into a shell on the `test-runner`
# container. Exits cancelling any further shell commands.
if [ "$1" = "--shell" ]; then
	$TEST_RUNNER_COMPOSE run --rm test-runner -c "bash"
	exit 0
fi

function down_test_runner {
	local running
	running=$($TEST_RUNNER_COMPOSE ps --quiet)
	if [ -n "$running" ]; then
		$TEST_RUNNER_COMPOSE down
	fi
}
