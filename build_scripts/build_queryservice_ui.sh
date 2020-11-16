#!/bin/bash
set -e

TARBALL="wikidata-query-gui.tar.gz"
TEMP_DIR="$(mktemp -d)"
TARBALL_PATH="$TEMP_DIR/$TARBALL"

git clone 'https://github.com/wikimedia/wikidata-query-gui.git' $TEMP_DIR
cd $TEMP_DIR 

echo "Checking out $COMMIT_HASH"
git reset $COMMIT_HASH --hard

rm -rfv "$TEMP_DIR/.git"
rm -fv "$TEMP_DIR/.gitignore"

GZIP=-9 tar -C "$TEMP_DIR" -zcvf $TARBALL_PATH .
echo "TARBALL_PATH="$TARBALL_PATH"" >> $GITHUB_ENV