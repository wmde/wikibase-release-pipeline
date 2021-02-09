#!/bin/bash
set -ex

ROOT="$(pwd)"
WDQS_UI_GIT_DIR="$(mktemp -d)"
TARBALL_PATH="$ROOT"/artifacts/wdqs-frontend.tar.gz

UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$QUERYSERVICE_UI_COMMIT_HASH" \
    "$ROOT/git_cache/services/wikidata-query-gui.git" \
    WDQS_UI \
    "$WDQS_UI_GIT_DIR" \
    master

bash "$ROOT"/build/clean_repo.sh "$WDQS_UI_GIT_DIR"

GZIP=-9 tar -C "$WDQS_UI_GIT_DIR" -zcvf "$TARBALL_PATH" .

cd "$ROOT"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi