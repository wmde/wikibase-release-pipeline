#!/bin/bash
set -e

cd test

docker-compose \
    -f docker-compose-selenium-test.yml \
    build
docker-compose \
    -f docker-compose-selenium-test.yml \
    run --rm wikibase-selenium-test npm run "test:reporter"

docker-compose down