#!/usr/bin/env bash

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

# Explicitly adds the Docker network wikibase-suite-test which is shared by both
# test-runner and test-services
docker network create wikibase-suite-test > /dev/null 2>&1 || true

export TEST_RUNNER_COMPOSE="docker compose -f test/docker-compose.yml --env-file test/test-runner.env --env-file local.env --project-directory test --progress quiet"
