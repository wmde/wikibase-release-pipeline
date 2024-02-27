#!/usr/bin/env bash

# ℹ️ Update Commit Hashes
docker compose \
--file test/docker-compose.yml \
--env-file test/test-runner.env \
run --rm --build test-runner -c "
cd ..
python3 -m pip install requests bs4 lxml
python3 update_commits.py
"
