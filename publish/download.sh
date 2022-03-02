#!/bin/bash
set -e

cd publish

docker-compose build download_artifacts && docker-compose run --rm download_artifacts