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

source ./versions.inc.sh


DOCKER_BUILD_CACHE_OPT=""

# ℹ️ Update Commit Hashes
function update_commit_hashes {
    docker build ./test -t wikibase-test-runner
    docker run --rm -v "$(pwd)":/workspace wikibase-test-runner bash -c "
        cd /workspace
        python3 update_commits.py
    "
}

# wikibase/wdqs -> wdqs
function image_url_to_image_name {
    local image_url="$1"

    # this will complain about image urls with tags in the end, e.g. foo:latest
    colon_count=$(grep -o ":" <<< "$image_url" | wc -l)
    if [[ $colon_count -gt 0 ]]; then
        echo "Incompatible image url '${image_url}'. Only dockerhub 'namespace/image_name' supported." > /dev/stderr
        exit 1
    fi

    # this will complain about image urls with hostnames, e.g. ghcr.io/foo/bar
    slash_count=$(grep -o "/" <<< "$image_url" | wc -l)
    if [[ $slash_count -gt 1 ]]; then
        echo "Incompatible image url '${image_url}'. Only dockerhub 'namespace/image_name' supported." > /dev/stderr
        exit 1
    fi

    # only take the second half of the url, the name after the slash
    echo "$image_url" | cut -d'/' -f 2
}


function build_wikibase {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg PHP_IMAGE_URL="$PHP_IMAGE_URL" \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg MEDIAWIKI_VERSION="$MEDIAWIKI_VERSION" \
        \
        --build-arg WIKIBASE_COMMIT="$WIKIBASE_COMMIT" \
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
        --build-arg MW_WG_SITENAME="$MW_WG_SITENAME" \
        --build-arg MW_WG_LANGUAGE_CODE="$MW_WG_LANGUAGE_CODE" \
        \
        -t "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" \
        \
        build/Wikibase

    mapfile -t tags < <(version_tags "wikibase")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL:$tag"
    done

}


function build_elasticseach {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg=ELASTICSEARCH_IMAGE_URL="$ELASTICSEARCH_IMAGE_URL" \
        --build-arg=ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA="$ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA" \
        --build-arg=ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER="$ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER" \
        \
        -t "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL" \
        \
        build/Elasticsearch

    mapfile -t tags < <(version_tags "elasticsearch")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL" "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL:$tag"
    done
}


function build_wdqs {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg DEBIAN_IMAGE_URL="$DEBIAN_IMAGE_URL" \
        --build-arg JRE_IMAGE_URL="$JRE_IMAGE_URL" \
        --build-arg WDQS_VERSION="$WDQS_VERSION" \
        \
        -t "$WIKIBASE_SUITE_WDQS_IMAGE_URL" \
        \
        build/WDQS

    mapfile -t tags < <(version_tags "wdqs")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_WDQS_IMAGE_URL" "$WIKIBASE_SUITE_WDQS_IMAGE_URL:$tag"
    done
}


function build_wdqs-frontend {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg NGINX_IMAGE_URL="$NGINX_IMAGE_URL" \
        --build-arg NODE_IMAGE_URL="$NODE_IMAGE_URL" \
        --build-arg WDQSQUERYGUI_COMMIT="$WDQSQUERYGUI_COMMIT" \
        \
        -t "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL" \
        \
        build/WDQS-frontend

    mapfile -t tags < <(version_tags "wdqs-frontend")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL" "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL:$tag"
    done
}


function build_wdqs-proxy {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg NGINX_IMAGE_URL="$NGINX_IMAGE_URL" \
        \
        -t "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL" \
        \
        build/WDQS-proxy

    mapfile -t tags < <(version_tags "wdqs-proxy")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL" "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL:$tag"
    done
}


function build_quickstatements {
    docker build \
        --quiet \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg PHP_IMAGE_URL="$PHP_IMAGE_URL" \
        --build-arg QUICKSTATEMENTS_COMMIT="$QUICKSTATEMENTS_COMMIT" \
        --build-arg MAGNUSTOOLS_COMMIT="$MAGNUSTOOLS_COMMIT" \
        \
        --build-arg MW_WG_SITENAME="$MW_WG_SITENAME" \
        --build-arg MW_WG_LANGUAGE_CODE="$MW_WG_LANGUAGE_CODE" \
        \
        -t "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL" \
        \
        build/QuickStatements

    mapfile -t tags < <(version_tags "quickstatements")
    for tag in "${tags[@]}"; do
        docker tag "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL" "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL:$tag"
    done
}


function build_all {
    build_wikibase &
    build_elasticseach &
    build_wdqs &
    build_wdqs-frontend &
    build_wdqs-proxy &
    build_quickstatements &
    wait
}


build_target_set=false

for arg in "$@"; do
    case $arg in
        wikibase)
            build_wikibase
            build_target_set=true
            ;;
        elasticsearch)
            build_elasticseach
            build_target_set=true
            ;;
        wdqs)
            build_wdqs
            build_target_set=true
            ;;
        wdqs-frontend)
            build_wdqs-frontend
            build_target_set=true
            ;;
        wdqs-proxy)
            build_wdqs-proxy
            build_target_set=true
            ;;
        quickstatements)
            build_quickstatements
            build_target_set=true
            ;;
        all)
            build_all
            build_target_set=true
            ;;
        update_hashes)
            update_commit_hashes
            exit 0
            ;;
        -n|--no-cache)
            DOCKER_BUILD_CACHE_OPT="--no-cache"
            ;;
        *)
            echo "Unknown argument: $arg" > /dev/stderr
            exit 1
            ;;
    esac
done

if ! $build_target_set; then
    build_all
fi
