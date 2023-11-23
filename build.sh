#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

set -x

set -o allexport
# shellcheck disable=SC1091
source ./variables.env

if [ -f ./local.env ]; then
    # shellcheck disable=SC1091
    source ./local.env
fi

set +o allexport

# env

SAVE_IMAGE=false

# TODO: move to flat file hierarchy
# TODO: how do we tag actually?
#
#

function save_image {
    if $SAVE_IMAGE; then
        docker save "$tag_version" "$tag_latest"| \
            gzip -"$GZIP_COMPRESSION_RATE" > "artifacts/${service_name}.docker.tar.gz"
    fi
}

function build_wikibase {
    service_name="wikibase"
    tag_version="${service_name}:${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg MEDIAWIKI_IMAGE="$MEDIAWIKI_IMAGE" \
        --build-arg WIKIBASE_COMMIT="$WIKIBASE_COMMIT" \
        \
        --build-arg MEDIAWIKI_SETTINGS_TEMPLATE_FILE="$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" \
        \
        --build-arg MW_SITE_NAME="$MW_SITE_NAME" \
        --build-arg MW_SITE_LANG="$MW_SITE_LANG" \
        --build-arg MW_WG_JOB_RUN_RATE="$MW_WG_JOB_RUN_RATE" \
        --build-arg MW_WG_ENABLE_UPLOADS="$MW_WG_ENABLE_UPLOADS" \
        --build-arg MW_WG_UPLOAD_DIRECTORY="$MW_WG_UPLOAD_DIRECTORY" \
        --build-arg WIKIBASE_PINGBACK="$WIKIBASE_PINGBACK" \
        \
        ./build/Wikibase -t "$tag_version" -t "$tag_latest"
    save_image

    service_name="wikibase-bundle"
    tag_version="${service_name}:${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg WMDE_RELEASE_VERSION="$WMDE_RELEASE_VERSION" \
        \
        --build-arg BABEL_COMMIT="$BABEL_COMMIT" \
        --build-arg CLDR_COMMIT="$CLDR_COMMIT" \
        --build-arg BABEL_COMMIT="$BABEL_COMMIT" \
        --build-arg CLDR_COMMIT="$CLDR_COMMIT" \
        --build-arg CIRRUSSEARCH_COMMIT="$CIRRUSSEARCH_COMMIT" \
        --build-arg CONFIRMEDIT_COMMIT="$CONFIRMEDIT_COMMIT" \
        --build-arg ELASTICA_COMMIT="$ELASTICA_COMMIT" \
        --build-arg ENTITYSCHEMA_COMMIT="$ENTITYSCHEMA_COMMIT" \
        --build-arg NUKE_COMMIT="$NUKE_COMMIT" \
        --build-arg OAUTH_COMMIT="$OAUTH_COMMIT" \
        --build-arg SCRIBUNTO_COMMIT="$SCRIBUNTO_COMMIT" \
        --build-arg SYNTAXHIGHLIGHT_GESHI_COMMIT="$SYNTAXHIGHLIGHT_GESHI_COMMIT" \
        --build-arg UNIVERSALLANGUAGESELECTOR_COMMIT="$UNIVERSALLANGUAGESELECTOR_COMMIT" \
        --build-arg VISUALEDITOR_COMMIT="$VISUALEDITOR_COMMIT" \
        --build-arg WIKIBASECIRRUSSEARCH_COMMIT="$WIKIBASECIRRUSSEARCH_COMMIT" \
        --build-arg WIKIBASEMANIFEST_COMMIT="$WIKIBASEMANIFEST_COMMIT" \
        --build-arg WIKIBASEEDTF_COMMIT="$WIKIBASEEDTF_COMMIT" \
        --build-arg WIKIBASELOCALMEDIA_COMMIT="$WIKIBASELOCALMEDIA_COMMIT" \
        \
        ./build/WikibaseBundle -t "$tag_version" -t "$tag_latest"
    save_image
}

function build_elasticseach {
    service_name="elasticsearch"
    tag_version="${service_name}:${ELASTICSEARCH_VERSION}-${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
        --build-arg=ELASTICSEARCH_PLUGIN_EXTRA_VERSION="$ELASTICSEARCH_PLUGIN_EXTRA_VERSION" \
        build/Elasticsearch/ -t "$tag_version" -t "$tag_latest"
    save_image
}

function build_wdqs {
    service_name="wdqs"
    tag_version="${service_name}:${WDQS_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg DEBIAN_IMAGE="$DEBIAN_IMAGE" \
        --build-arg JDK_IMAGE="$JDK_IMAGE" \
        --build-arg WDQS_VERSION="$WDQS_VERSION" \
        \
        build/WDQS/ -t "$tag_version" -t "$tag_latest"
    save_image
}

function build_wdqs-frontend {
    service_name="wdqs-frontend"
    tag_version="${service_name}:${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg NGINX_IMAGE="$NGINX_IMAGE" \
        --build-arg NODE_IMAGE="$NODE_IMAGE" \
        --build-arg WDQSQUERYGUI_COMMIT="$WDQSQUERYGUI_COMMIT" \
        \
        build/WDQS-frontend/ -t "$tag_version" -t "$tag_latest"
    save_image
}

function build_wdqs-proxy {
    service_name="wdqs-proxy"
    tag_version="${service_name}:${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg NGINX_IMAGE="$NGINX_IMAGE" \
        \
        build/WDQS-proxy/ -t "$tag_version" -t "$tag_latest"
    save_image
}

function build_quickstatements {
    service_name="quickstatements"
    tag_version="${service_name}:${WMDE_RELEASE_VERSION}"
    tag_latest="${service_name}:latest"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg PHP_IMAGE="$PHP_IMAGE" \
        --build-arg QUICKSTATEMENTS_COMMIT="$QUICKSTATEMENTS_COMMIT" \
        --build-arg MAGNUSTOOLS_COMMIT="$MAGNUSTOOLS_COMMIT" \
        \
        build/QuickStatements/ -t "$tag_version" -t "$tag_latest" 
    save_image
}

function build_all {
    build_wikibase
    build_elasticseach
    build_wdqs
    build_wdqs-frontend
    build_wdqs-proxy
    build_quickstatements
}


if [ $# -eq 0 ]; then
    build_all
else
    for arg in "$@"; do
        case $arg in
            wikibase) build_wikibase ;;
            elasticsearch) build_elasticseach ;;
            wdqs) build_wdqs ;;
            wdqs-frontend) build_wdqs-frontend ;;
            wdqs-proxy) build_wdqs-proxy ;;
            quickstatements) build_quickstatements ;;
            all) build_all ;;
            -s|--save-image) SAVE_IMAGE=true ;;
            *)
                echo "Unknown argument: $arg"
                exit 1
                ;;
        esac
    done
fi
