#!/bin/bash
set -e

ROOT="$(pwd)"

TEMP_GIT_DIR="$(mktemp -d)"
MEDIAWIKI_DIR="$TEMP_GIT_DIR/mediawiki"
TARBALL_PATH="$ROOT/artifacts/mediawiki-$MEDIAWIKI_BRANCH_NAME.tar.gz"

chmod 777 "$ROOT/artifacts/"
if [ ! -d $MEDIAWIKI_DIR ]; then
   git clone --branch $MEDIAWIKI_BRANCH_NAME "$ROOT/git_cache/core.git" "$MEDIAWIKI_DIR"
fi

# Add vector from cache
if [ ! -d "$MEDIAWIKI_DIR/skins/Vector" ]; then
   git clone --branch $MEDIAWIKI_BRANCH_NAME "$ROOT/git_cache/skins/Vector.git" "$MEDIAWIKI_DIR/skins/Vector"
fi

# remove git things from release package
rm "$MEDIAWIKI_DIR/".git* -rfv

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf $TARBALL_PATH mediawiki

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH="$TARBALL_PATH"" >> $GITHUB_ENV
else
    export TARBALL_PATH
fi