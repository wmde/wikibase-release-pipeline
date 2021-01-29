#!/bin/bash
set -e

cd publish
USER_ID=$(id -u)
export USER_ID

docker-compose build download_artifacts && docker-compose run download_artifacts