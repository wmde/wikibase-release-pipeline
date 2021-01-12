#!/bin/bash

ls /extractedArtifacts/BuildMetadata/
git clone --single-branch --branch ${WIKIBASE_BRANCH_NAME} "/git_cache/Wikibase.git" "/repo/Wikibase"
cd /repo/Wikibase
git tag -a $RELEASE_VERSION -m $WORKFLOW_RUN_NUMBER