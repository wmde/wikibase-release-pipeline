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

function wikibase_version {
    echo "$MEDIAWIKI_VERSION-$WMDE_RELEASE_VERSION"
}

function elasticsearch_version {
    echo "$ELASTICSEARCH_VERSION-$WMDE_RELEASE_VERSION"
}

function wdqs_version {
    echo "$WDQS_VERSION-$WMDE_RELEASE_VERSION"
}

function wdqs_frontend_version {
    echo "$WMDE_RELEASE_VERSION"
}

function wdqs_proxy_version {
    echo "$WMDE_RELEASE_VERSION"
}

function quickstatements_version {
    echo "$WMDE_RELEASE_VERSION"
}

function image_version {
    image=$1

    if [ "$image" = "wikibase" ]; then
        wikibase_version
    elif [ "$image" = "elasticsearch" ]; then
        elasticsearch_version
    elif [ "$image" = "wdqs" ]; then
        wdqs_version
    elif [ "$image" = "wdqs-frontend" ]; then
        wdqs_frontend_version
    elif [ "$image" = "wdqs-proxy" ]; then
        wdqs_proxy_version
    elif [ "$image" = "quickstatements" ]; then
        quickstatements_version
    fi
}

