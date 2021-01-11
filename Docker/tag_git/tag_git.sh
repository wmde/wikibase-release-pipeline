#!/bin/bash

git clone --single-branch --branch ${WIKIBASE_BRANCH_NAME} "/git_cache/Wikibase.git" "/repo/Wikibase"
cd /repo/Wikibase
git tag -a v1.4 -m $RELEASE_VERSION