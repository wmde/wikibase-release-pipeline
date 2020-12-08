#!/bin/bash
set -e

DOCKER_INCLUDE_SETTINGS=/var/www/html/LocalSettings/LocalSettings.debug.php

docker-compose down
docker-compose up -d --force-recreate
docker-compose logs -f --no-color > "log/wikibase.curl.log" &

docker-compose -f docker-compose.yml -f docker-compose-test.yml build wikibase-test
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test