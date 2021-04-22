#!/bin/bash
# shellcheck disable=SC1091,SC2086
set -e

# stop any upgrade tests
set -o allexport; source upgrade/default_variables.env; set +o allexport
docker-compose -f docker-compose.upgrade.yml down --volumes --remove-orphans

DEFAULT_SUITE_CONFIG="-f docker-compose.yml"

ALL_SUITES_FILES="$(find suite-config/ -name "docker-compose.override.yml")"
ALL_SUITES=""
for FILE in $ALL_SUITES_FILES; do
    ALL_SUITES="$ALL_SUITES -f $FILE"
done

# stop any suite things
docker-compose $DEFAULT_SUITE_CONFIG $ALL_SUITES -f docker-compose-selenium-test.yml down --volumes
