#!/bin/bash

docker load -i $WIKIBASE_IMAGE_NAME
docker-compose up -d
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh 