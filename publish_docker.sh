#!/bin/bash

cd publish_scripts
docker-compose run download_artifacts
docker-compose run upload_dockerhub
