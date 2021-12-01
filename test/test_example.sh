#!/bin/bash
# shellcheck disable=SC1091,SC1090
set -e

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "SUITE is not set"
    exit 1
fi

cd test

set -o allexport; source example-test.env; set +o allexport

## Use in combination with example compose files 
export DEFAULT_SUITE_CONFIG="--env-file ../example/template.env -f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml -f docker-compose.example.yml"

bash run_selenium.sh "$SUITE"
