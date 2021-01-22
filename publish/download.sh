#!/bin/bash
set -e

cd publish
USER_ID=$(id -u)
GROUP_ID=$(id -g)

export USER_ID
export GROUP_ID

docker-compose build download_artifacts && docker-compose run download_artifacts