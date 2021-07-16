#!/bin/bash
# shellcheck disable=SC1091,SC1090
set -e

TEMP_DIR="/tmp/example_test"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

cp -r example/* "$TEMP_DIR"
cd "$TEMP_DIR"
mkdir -p log

# create env
cp template.env .env

# uncomment extra-install scripts
sed -i '16,22 s/#//' docker-compose.yml
docker-compose -f docker-compose.yml -f docker-compose.extra.yml up -d
docker-compose -f docker-compose.yml -f docker-compose.extra.yml logs -f --no-color > "log/example.log" &
