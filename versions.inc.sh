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
        echo "$WBS_WIKIBASE_VERSION"
    elif [ "$image" = "elasticsearch" ]; then
        echo "$WBS_ELASTICSEARCH_VERSION"
    elif [ "$image" = "wdqs" ]; then
        echo "$WBS_WDQS_VERSION"
    elif [ "$image" = "wdqs-frontend" ]; then
        echo "$WBS_WDQS_FRONTED_VERSION"
    elif [ "$image" = "wdqs-proxy" ]; then
        echo "$WBS_WDQS_PROXY_VERSION"
    elif [ "$image" = "quickstatements" ]; then
        echo "$WBS_QUICKSTATEMENTS_VERSION"
    fi
}

function version_tags() {
    local image_name=$1
    local version
    version=$(image_version "${image_name}")
    local date_tag
    date_tag=$(date +"%Y%m%d%H%M%S")

    local tags=(
        "${version}-build${date_tag}"
        "$version"
        "${version%.*}"
        "${version%%.*}"
    )

    # Extra tags
    if [[ "$image_name" == "wikibase" ]]; then
        tags+=("${WBS_WIKIBASE_VERSION}-mw${MEDIAWIKI_VERSION}")
    elif [[ "$image_name" == "elasticsearch" ]]; then
        tags+=("${WBS_ELASTICSEARCH_VERSION}-es${ELASTICSEARCH_VERSION}")
    elif [[ "$image_name" == "wdqs" ]]; then
        tags+=("${WBS_WDQS_VERSION}-wdqs${WDQS_VERSION}")
    elif [[ "$image_name" == "quickstatements" ]]; then
        tags+=("${WBS_QUICKSTATEMENTS_VERSION}-qs${QUICKSTATEMENTS_VERSION}")
    fi

    printf "%s\n" "${tags[@]}"
}

