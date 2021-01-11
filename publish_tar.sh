#!/bin/bash
set -e

cd publish_scripts
docker-compose build download_artifacts && docker-compose run download_artifacts
docker-compose build upload_tar && docker-compose run upload_tar --rm