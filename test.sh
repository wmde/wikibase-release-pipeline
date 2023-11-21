#!/usr/bin/env bash
set -e

export SUITE=$1

cd test
docker compose --env-file ../local.env --env-file ../variables.env --env-file default.env -f docker-compose.yml -f suites/docker-compose.yml up -d --build --scale test-runner=0
docker compose --env-file ../local.env --env-file ../variables.env --env-file default.env -f docker-compose.yml -f suites/docker-compose.yml run test-runner -c "npx wdio ./suites/$SUITE/$SUITE.conf.ts"
