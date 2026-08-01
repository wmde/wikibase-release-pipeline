#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit

python3 scripts/update-commits/update_commits.py "images/$1/build.env"
