#!/bin/bash
set -e

ROOT="$(pwd)"
BRANCH="REL1_35"

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(mktemp -d)"

git clone --depth 1 --single-branch --branch ${BRANCH} "$ROOT/git_cache/Wikibase.git" "$TEMP_GIT_DIR"
git -C "$TEMP_GIT_DIR" submodule update

# remove git things from release package
rm "$TEMP_GIT_DIR/".git* -rfv

GZIP=-9 tar -zcvf "$TEMP_TAR_DIR"/Wikibase.tar.gz "$TEMP_GIT_DIR"

echo "TARBALL_PATH="$TEMP_TAR_DIR/Wikibase.tar.gz"" >> $GITHUB_ENV