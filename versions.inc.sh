#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'
# set -x

set -o allexport
# shellcheck disable=SC1091
source ./variables.env
if [ -f ./local.env ]; then
    # shellcheck disable=SC1091
    source ./local.env
fi
set +o allexport

function image_version {
    image=$1

    if [ "$image" = "wikibase" ]; then
        echo "$WIKIBASE_VERSION"
    elif [ "$image" = "elasticsearch" ]; then
        echo "$ELASTICSEARCH_WBS_VERSION"
    elif [ "$image" = "wdqs" ]; then
        echo "$WDQS_VERSION"
    elif [ "$image" = "wdqs-frontend" ]; then
        echo "$WDQS_FRONTED_VERSION"
    elif [ "$image" = "wdqs-proxy" ]; then
        echo "$WDQS_PROXY_VERSION"
    elif [ "$image" = "quickstatements" ]; then
        echo "$QUICKSTATEMENTS_VERSION"
    fi
}

function version_tags() {
    local image_name=$1
    local version
    version=$(image_version "${image_name}")

    local tags=(
        "$version"
        "${version%.*}"
        "${version%%.*}"
        "deploy-${DEPLOY_VERSION%%.*}"
    )

    # Extra tags
    if [[ "$image_name" == "wikibase" ]]; then
        tags+=("${WIKIBASE_VERSION}+mw-${MEDIAWIKI_VERSION}")
    elif [[ "$image_name" == "elasticsearch" ]]; then
        tags+=("${ELASTICSEARCH_WBS_VERSION}+${ELASTICSEARCH_VERSION}")
    elif [[ "$image_name" == "wdqs" ]]; then
        tags+=("${WDQS_WBS_VERSION}+${WDQS_VERSION}")
    fi

    printf "%s\n" "${tags[@]}"
}

