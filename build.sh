#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

set -x

set -o allexport
source ./variables.env
source ./local.env
set +o allexport

# env

# TODO: move to flat file hierarchy
# TODO: how do we tag actually?
#
function build_wikibase {
    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg MEDIAWIKI_IMAGE="$MEDIAWIKI_IMAGE" \
        --build-arg GIT_CURRENT_REVISION="$(git rev-parse HEAD)" \
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
        ./Docker/build/Wikibase -t wikibase:${WMDE_RELEASE_VERSION}

    docker save wikibase:${WMDE_RELEASE_VERSION} | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/wikibase.docker.tar.gz

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
        ./Docker/build/WikibaseBundle -t wikibase-bundle:${WMDE_RELEASE_VERSION}

    docker save wikibase-bundle:${WMDE_RELEASE_VERSION} | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/wikibase-bundle.docker.tar.gz
}

function build_elasticseach {
    image_name="elasticsearch:${ELASTICSEARCH_VERSION}-${WMDE_RELEASE_VERSION}"
    docker build \
        --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
        --build-arg=ELASTICSEARCH_PLUGIN_EXTRA_VERSION="$ELASTICSEARCH_PLUGIN_EXTRA_VERSION" \
        Docker/build/Elasticsearch/ -t $image_name

    docker save $image_name | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/elasticsearch.docker.tar.gz
}

function build_wdqs {
    echo "implement me"
}

function build_wdqs-frontend {
    image_name="wdqs-frontend:${WMDE_RELEASE_VERSION}"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg NGINX_IMAGE="$NGINX_IMAGE" \
        --build-arg NODE_IMAGE="$NODE_IMAGE" \
        --build-arg WDQSQUERYGUI_COMMIT="$WDQSQUERYGUI_COMMIT" \
        \
        Docker/build/WDQS-frontend/ -t "$image_name"

    docker save "$image_name" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/wdqs-frontend.docker.tar.gz
}

function build_wdqs-proxy {
    image_name="wdqs-proxy:${WMDE_RELEASE_VERSION}"

    docker build \
        --build-arg NGINX_IMAGE="$NGINX_IMAGE" \
        \
        Docker/build/WDQS-proxy/ -t "$image_name"

    docker save "$image_name" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/wdqs-proxy.docker.tar.gz
}

function build_quickstatements {
    image_name="quickstatements:${WMDE_RELEASE_VERSION}"

    docker build \
        --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
        --build-arg QUICKSTATEMENTS_COMMIT="$QUICKSTATEMENTS_COMMIT" \
        --build-arg MAGNUSTOOLS_COMMIT="$MAGNUSTOOLS_COMMIT" \
        \
        Docker/build/QuickStatements/ -t "$image_name"

    docker save $image_name | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/quickstatements.docker.tar.gz
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
            *)
                echo "Unknown option: $arg"
                exit 2 # code appropriate?
                ;;
        esac
    done
fi
