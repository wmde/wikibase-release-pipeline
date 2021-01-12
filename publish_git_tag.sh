#!/bin/bash
set -e

cd publish_scripts
docker-compose build download_artifacts && docker-compose run download_artifacts
docker-compose build tag_git && docker-compose run tag_git --rm