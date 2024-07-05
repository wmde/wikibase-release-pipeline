#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Function to determine image versions
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

# Function to generate version tags
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
    fi

    printf "%s\n" "${tags[@]}"
}

# Function to tag images
function tag_image {
    local image=$1
    local tags
    tags=$(version_tags "$image")
    for tag in $tags; do
        docker tag "$image" "$image:$tag"
    done
}

# Tag each image
tag_image "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL"
tag_image "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL"
tag_image "$WIKIBASE_SUITE_WDQS_IMAGE_URL"
tag_image "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL"
tag_image "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL"
tag_image "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL"
