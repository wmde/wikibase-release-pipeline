#!/usr/bin/env bash
# shellcheck disable=SC1091,SC1090
set -e

cd test

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "SUITE is not set. defaulting to example"
    export SUITE="example"
fi

set -o allexport; source ../example/template.env; source suite-config/example/example.env; set +o allexport

# log directory setup
export LOG_DIR="log/$SUITE"
export TEST_LOG="$LOG_DIR/$SUITE.log"

rm -f "$TEST_LOG" || true
mkdir -p "$LOG_DIR"

# TODO These names should probably not differ MYSQL_IMAGE_NAME comes from example
export DATABASE_IMAGE_NAME="$MYSQL_IMAGE_NAME"
## Use in combination with example compose files 
export DEFAULT_SUITE_CONFIG="-f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml"

bash scripts/run_selenium.sh "$SUITE"
