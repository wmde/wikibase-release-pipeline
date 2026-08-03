#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit

python3 scripts/update-sources/update_sources.py "images/$1/build.env" "${2:-}"
