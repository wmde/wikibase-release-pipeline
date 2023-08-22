#!/usr/bin/env bash
# shellcheck disable=SC1091,SC1090
set -e

cd test

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "ℹ️  SUITE is not set. defaulting to \"example\""
    export SUITE="example"
fi

# log directory setup
export RESULTS_DIR="suites/$SUITE/results"
export TEST_LOG="$RESULTS_DIR/$SUITE.log"
docker compose run --rm test-runner -c "rm -rf \"$RESULTS_DIR\"" > /dev/null 2>&1
mkdir -p "$RESULTS_DIR"

echo -e "\n▶️  Setting-up \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"

set -o allexport; source ../example/template.env; source suites/example/example.env; set +o allexport
# TODO These names should probably not differ MYSQL_IMAGE_NAME comes from example
export DATABASE_IMAGE_NAME="$MYSQL_IMAGE_NAME"
## Use in combination with example compose files 
export DEFAULT_SUITE_CONFIG="-f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml"

bash scripts/run_selenium.sh "$SUITE"
