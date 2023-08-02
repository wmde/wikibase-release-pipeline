#!/usr/bin/env bash
set -e

ROOT="$(pwd)"
TARBALL=quickstatements.tar.gz
TARBALL_PATH="$ROOT/artifacts/$TARBALL"

# clone and clean quickstatements
TEMP_GIT_DIR=$(mktemp -d)
QUICKSTATEMENTS_GIT_DIR="$TEMP_GIT_DIR/quickstatements"
UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh "$QUICKSTATEMENTS_COMMIT_HASH" "$ROOT/git_cache/services/quickstatements.git" quickstatements "$QUICKSTATEMENTS_GIT_DIR" master
bash "$ROOT"/build/clean_repo.sh "$QUICKSTATEMENTS_GIT_DIR"

# clone and clean magnustools
MAGNUSTOOLS_GIT_DIR="$TEMP_GIT_DIR/magnustools"
UPDATE_SUBMODULE=0 bash "$ROOT"/build/clone_repo.sh "$MAGNUSTOOLS_COMMIT_HASH" "$ROOT/git_cache/services/magnustools.git" magnustools "$MAGNUSTOOLS_GIT_DIR" master
bash "$ROOT"/build/clean_repo.sh "$MAGNUSTOOLS_GIT_DIR"

cd "$TEMP_GIT_DIR"
tar -C "$TEMP_GIT_DIR" -cvf - magnustools quickstatements | gzip -"$GZIP_COMPRESSION_RATE" > "$TARBALL_PATH"
cd -

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi