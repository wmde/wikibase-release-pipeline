#!/bin/bash

ROOT="$(pwd)"
BRANCH="REL1_35"

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(mktemp -d)"

git clone --depth 1 --single-branch --branch ${BRANCH} "$ROOT/git_cache/Wikibase.git" "$TEMP_GIT_DIR"
git -C "$TEMP_GIT_DIR/Wikibase" submodule update

# remove git things from release package
rm "$TEMP_GIT_DIR/Wikibase".git* -rfv

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcvf "$TEMP_TAR_DIR"/Wikibase.tar.gz Wikibase

echo "TARBALL_PATH="$TEMP_TAR_DIR/Wikibase.tar.gz"" >> $GITHUB_ENV