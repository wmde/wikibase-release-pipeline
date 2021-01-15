#!/bin/bash
set -e

cd publish
docker-compose build download_artifacts && docker-compose run download_artifacts
docker-compose build upload_dockerhub && docker-compose run upload_dockerhub --rm