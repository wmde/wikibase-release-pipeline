#!/bin/bash

bash update_cache.sh

. ./build_scripts/build_wikibase.sh
bash build_scripts/build_wikibase_docker.sh "$WIKIBASE_IMAGE_NAME"

. ./build_scripts/build_queryservice.sh
bash build_scripts/build_queryservice_docker.sh "$QUERYSERVICE_IMAGE_NAME"

. ./build_scripts/build_queryservice_ui.sh
bash build_scripts/build_queryservice_ui_docker.sh "$QUERYSERVICE_UI_IMAGE_NAME"