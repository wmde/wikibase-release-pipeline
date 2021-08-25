#!/bin/bash
set -e

## WikibaseEDTF
UPDATE_SUBMODULE=0 bash build/clone_repo.sh \
    "$WIKIBASEEDTF_COMMIT_HASH" \
    "git_cache/WikibaseEdtf.git" \
    WIKIBASEEDTF \
    "$BUILT_EXTENSIONS_PATH/WikibaseEdtf" \
    master

bash build/clean_repo.sh "$BUILT_EXTENSIONS_PATH/WikibaseEdtf"