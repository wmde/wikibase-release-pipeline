#!/bin/bash

cd test_scripts
ls
ls ../
docker load -i "../$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker load -i "../$QUERYSERVICE_IMAGE_NAME.docker.tar.gz"
docker load -i "../$QUERYSERVICE_UI_IMAGE_NAME.docker.tar.gz"
docker-compose up -d
docker-compose -f docker-compose.yml -f docker-compose-test.yml build wikibase-test
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh