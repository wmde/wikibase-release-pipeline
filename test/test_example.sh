#!/usr/bin/env bash
# shellcheck disable=SC1091,SC1090
set -e

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "SUITE is not set. defaulting to example"
    export SUITE="example"
fi

cd test
set -o allexport; source ../example/template.env; source example.env; set +o allexport

# log directory setup
export LOG_DIR="log/$SUITE"
export SETUP_LOG="$LOG_DIR/setup.log"
export TEST_LOG="$LOG_DIR/$SUITE.log"

rm -f "$SETUP_LOG" || true
rm -f "$TEST_LOG" || true
rm -rf "$LOG_DIR/wikibase"
rm -rf "$LOG_DIR/client"
mkdir -p "$LOG_DIR/wikibase"
mkdir -p "$LOG_DIR/client"

# TODO These names should probably not differ MYSQL_IMAGE_NAME comes from example
export DATABASE_IMAGE_NAME="$MYSQL_IMAGE_NAME"
## Use in combination with example compose files 
export DEFAULT_SUITE_CONFIG="-f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml -f docker-compose.example.yml"

bash run_selenium.sh "$SUITE"
