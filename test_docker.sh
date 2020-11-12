#!/bin/bash

docker load -i "$WIKIBASE_IMAGE_NAME.tar.gz"
docker-compose up -d
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh 