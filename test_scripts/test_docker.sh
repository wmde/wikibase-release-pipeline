#!/bin/bash

cd test_scripts
docker load -i "$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker-compose up -d
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh 