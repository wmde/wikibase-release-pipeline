#!/bin/bash
set -e

## WikibaseLocalMedia
## NOTE: WikibaseLocalMedia does currently not work in a client only setup.
UPDATE_SUBMODULE=0 bash build/clone_repo.sh \
    "$WIKIBASELOCALMEDIA_COMMIT_HASH" \
    "git_cache/WikibaseLocalMedia.git" \
    WIKIBASELOCALMEDIA \
    "$BUILT_EXTENSIONS_PATH/WikibaseLocalMedia" \
    master

bash build/clean_repo.sh "$BUILT_EXTENSIONS_PATH/WikibaseLocalMedia"