#!/bin/bash
# shellcheck disable=SC1091,SC1090
set -e

ROOT=$PWD
TEMP_DIR="/tmp/example_test"

rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cp -r example/* "$TEMP_DIR"
cd "$TEMP_DIR"
mkdir -p log

# create env
cp template.env .env

cd "$ROOT/test"
set -o allexport; source example-test.env; set +o allexport

## Use in combination with example compose files 
export DEFAULT_SUITE_CONFIG="--env-file ../example/template.env -f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml -f docker-compose.example.yml"

bash run_selenium.sh repo
