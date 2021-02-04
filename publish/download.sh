#!/bin/bash
set -e

cd publish

docker-compose build download_artifacts && docker-compose run download_artifacts