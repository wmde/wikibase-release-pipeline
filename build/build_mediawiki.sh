#!/bin/bash
set -e

ROOT="$(pwd)"

TEMP_GIT_DIR="$(mktemp -d)"
MEDIAWIKI_DIR="$TEMP_GIT_DIR/mediawiki"
TARBALL_PATH="$ROOT/artifacts/mediawiki-$MEDIAWIKI_BRANCH_NAME.tar.gz"

chmod 777 "$ROOT/artifacts/"

UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$MEDIAWIKI_COMMIT_HASH" \
    "$ROOT/git_cache/core.git" \
    MEDIAWIKI \
    "$MEDIAWIKI_DIR" \
    "$MEDIAWIKI_BRANCH_NAME"

bash "$ROOT"/build/clean_repo.sh "$MEDIAWIKI_DIR"

rm -rf "$MEDIAWIKI_DIR/skins/Vector" # remove any existing folders

# Add Vector skin
UPDATE_SUBMODULE=0 bash "$ROOT"/build/clone_repo.sh \
    "$VECTOR_COMMIT_HASH" \
    "$ROOT/git_cache/skins/Vector.git" \
    VECTOR \
    "$MEDIAWIKI_DIR/skins/Vector" \
    "$MEDIAWIKI_BRANCH_NAME"

# remove git things from release package
bash "$ROOT"/build/clean_repo.sh "$MEDIAWIKI_DIR"
bash "$ROOT"/build/clean_repo.sh "$MEDIAWIKI_DIR/skins/Vector"

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf "$TARBALL_PATH" mediawiki

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi