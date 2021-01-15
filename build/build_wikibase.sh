#!/bin/bash
set -e

ROOT="$(pwd)"

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(pwd)"/artifacts
WIKIBASE_PATH="$TEMP_GIT_DIR/Wikibase"

git clone --depth 1 --single-branch --branch ${WIKIBASE_BRANCH_NAME} "$ROOT/git_cache/Wikibase.git" $WIKIBASE_PATH

GIT_TRACE=1 git -C $WIKIBASE_PATH submodule update --init --recursive

bash $ROOT/build/write_git_metadata.sh $WIKIBASE_PATH $ROOT/artifacts/build_metadata_wikibase.env "WIKIBASE_COMMIT_HASH"

# remove git things from release package
rm $WIKIBASE_PATH/.git* -rfv

# install composer dependencies for tarball
cd $WIKIBASE_PATH
composer install --no-dev --ignore-platform-reqs
cd -

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf "$TEMP_TAR_DIR"/Wikibase.tar.gz Wikibase

TARBALL_PATH="$TEMP_TAR_DIR/Wikibase.tar.gz"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH="$TARBALL_PATH"" >> $GITHUB_ENV
else
    export TARBALL_PATH
fi