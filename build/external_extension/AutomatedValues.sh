#!/bin/bash
set -e

## AutomatedValues
UPDATE_SUBMODULE=0 bash build/clone_repo.sh \
    "$AUTOMATEDVALUES_COMMIT_HASH" \
    "git_cache/AutomatedValues.git" \
    AUTOMATEDVALUES \
    "$BUILT_EXTENSIONS_PATH/AutomatedValues" \
    master

bash build/clean_repo.sh "$BUILT_EXTENSIONS_PATH/AutomatedValues"