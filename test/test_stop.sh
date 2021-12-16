#!/bin/bash
# shellcheck disable=SC1091,SC2086,SC2046
set -e

DEFAULT_SUITE_CONFIG=$1

if [[ -z "${DEFAULT_SUITE_CONFIG// }" ]]; then
    DEFAULT_SUITE_CONFIG="-f docker-compose.yml"
fi

ALL_SUITES_FILES="$(find suite-config/ -name "docker-compose.override.yml")"
ALL_SUITES=""
for FILE in $ALL_SUITES_FILES; do
    ALL_SUITES="$ALL_SUITES -f $FILE"
done

set +e

CONTAINERS=$(docker-compose $DEFAULT_SUITE_CONFIG $ALL_SUITES -f docker-compose-selenium-test.yml ps -q)

# stop any suite things
if [ -z "$CONTAINERS" ]; then
    echo "No containers to terminate."
else
    docker kill $CONTAINERS > /dev/null
    docker-compose $DEFAULT_SUITE_CONFIG $ALL_SUITES -f docker-compose-selenium-test.yml down --volumes
fi

set -e