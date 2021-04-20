#!/bin/bash
set -ex

ROOT="$(pwd)"
WDQS_FRONTEND_GIT_DIR="$(mktemp -d)"
TARBALL_PATH="$ROOT"/artifacts/wdqs-frontend.tar.gz

UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$WDQS_FRONTEND_COMMIT_HASH" \
    "$ROOT/git_cache/services/wikidata-query-gui.git" \
    WDQS_FRONTEND \
    "$WDQS_FRONTEND_GIT_DIR" \
    master

bash "$ROOT"/build/clean_repo.sh "$WDQS_FRONTEND_GIT_DIR"

cd "$WDQS_FRONTEND_GIT_DIR"
GZIP=-9 tar -zcvf "$TARBALL_PATH" -- *

cd "$ROOT"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi