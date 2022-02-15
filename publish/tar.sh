#!/bin/bash
set -e

cd publish
docker-compose build download_artifacts && docker-compose run --rm download_artifacts
docker-compose build upload_tar && docker-compose run --rm upload_tar