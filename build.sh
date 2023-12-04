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


SAVE_IMAGE=false
EXTRACT_TARBALL=false
DOCKER_BUILD_CACHE_OPT=""

function save_image {
    local image_name="$1"
    local image_url="$2"
    local image_name_with_tag="$3"
    local image_url_with_tag="$4"

    if $SAVE_IMAGE; then
        docker save "$image_url" "$image_url_with_tag" | \
            gzip -"$GZIP_COMPRESSION_RATE" > "artifacts/${image_name_with_tag//:/-}.docker.tar.gz"
        pushd artifacts
        ln -sf "${image_name_with_tag//:/-}.docker.tar.gz" "${image_name}.docker.tar.gz"
        popd
    fi
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


function setup_image_name_url_and_tag {
    local version_string="$2"

    # ‼️  HEADS UP! This will set the global vars 👿
    image_url="$1"
    image_name="$(image_url_to_image_name "$image_url")"
    image_name_with_tag="${image_name}:${version_string}"
    image_url_with_tag="${image_url}:${version_string}"
}


function build_wikibase {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" "$RELEASE_VERSION-$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg MEDIAWIKI_IMAGE_URL="$MEDIAWIKI_IMAGE_URL" \
        --build-arg WIKIBASE_COMMIT="$WIKIBASE_COMMIT" \
        \
        --build-arg MW_SITE_NAME="$MW_SITE_NAME" \
        --build-arg MW_SITE_LANG="$MW_SITE_LANG" \
        --build-arg MW_WG_JOB_RUN_RATE="$MW_WG_JOB_RUN_RATE" \
        --build-arg MW_WG_ENABLE_UPLOADS="$MW_WG_ENABLE_UPLOADS" \
        --build-arg MW_WG_UPLOAD_DIRECTORY="$MW_WG_UPLOAD_DIRECTORY" \
        --build-arg WIKIBASE_PINGBACK="$WIKIBASE_PINGBACK" \
        \
        build/Wikibase -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"

    if $EXTRACT_TARBALL; then
        docker run --entrypoint="" --rm "$image_url_with_tag" \
            tar cz -C /var/www --transform="s,^html,${image_name}," html \
                > "artifacts/${image_name_with_tag//:/-}.tar.gz"
        pushd artifacts
        ln -sf "${image_name_with_tag//:/-}.tar.gz" "${image_name}.tar.gz"
        popd
    fi

    setup_image_name_url_and_tag "$WIKIBASE_SUITE_WIKIBASE_BUNDLE_IMAGE_URL" "$RELEASE_VERSION-$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg WMDE_RELEASE_VERSION="$WMDE_RELEASE_VERSION" \
        --build-arg RELEASE_VERSION="$RELEASE_VERSION" \
        --build-arg WIKIBASE_SUITE_WIKIBASE_IMAGE_URL="$WIKIBASE_SUITE_WIKIBASE_IMAGE_URL" \
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
        build/WikibaseBundle -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"
}


function build_elasticseach {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL" "$ELASTICSEARCH_VERSION-$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg=ELASTICSEARCH_IMAGE_URL="$ELASTICSEARCH_IMAGE_URL" \
        --build-arg=ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA="$ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA" \
        --build-arg=ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER="$ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER" \
        \
        build/Elasticsearch/ -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"
}


function build_wdqs {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_WDQS_IMAGE_URL" "$WDQS_VERSION-$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg DEBIAN_IMAGE_URL="$DEBIAN_IMAGE_URL" \
        --build-arg JDK_IMAGE_URL="$JDK_IMAGE_URL" \
        --build-arg WDQS_VERSION="$WDQS_VERSION" \
        \
        build/WDQS/ -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"
}


function build_wdqs-frontend {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL" "$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg NGINX_IMAGE_URL="$NGINX_IMAGE_URL" \
        --build-arg NODE_IMAGE_URL="$NODE_IMAGE_URL" \
        --build-arg WDQSQUERYGUI_COMMIT="$WDQSQUERYGUI_COMMIT" \
        \
        build/WDQS-frontend/ -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"

    if $EXTRACT_TARBALL; then
        docker run --entrypoint="" --rm "$image_url_with_tag" \
            tar cz -C /usr/share/nginx --transform="s,^html,${image_name}," html \
                > "artifacts/${image_name_with_tag//:/-}.tar.gz"
        pushd artifacts
        ln -sf "${image_name_with_tag//:/-}.tar.gz" "${image_name}.tar.gz"
        popd
    fi
}


function build_wdqs-proxy {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL" "$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg NGINX_IMAGE_URL="$NGINX_IMAGE_URL" \
        \
        build/WDQS-proxy/ -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"
}


function build_quickstatements {
    setup_image_name_url_and_tag "$WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL" "$WMDE_RELEASE_VERSION"

    docker build \
        $DOCKER_BUILD_CACHE_OPT \
        --build-arg COMPOSER_IMAGE_URL="$COMPOSER_IMAGE_URL" \
        --build-arg PHP_IMAGE_URL="$PHP_IMAGE_URL" \
        --build-arg QUICKSTATEMENTS_COMMIT="$QUICKSTATEMENTS_COMMIT" \
        --build-arg MAGNUSTOOLS_COMMIT="$MAGNUSTOOLS_COMMIT" \
        \
        build/QuickStatements/ -t "$image_url_with_tag" -t "$image_url"

    save_image "$image_name" "$image_url" "$image_name_with_tag" "$image_url_with_tag"
}


function build_all {
    build_wikibase
    build_elasticseach
    build_wdqs
    build_wdqs-frontend
    build_wdqs-proxy
    build_quickstatements
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
        -s|--save-image)
            SAVE_IMAGE=true
            ;;
        -t|--extract-tarball)
            EXTRACT_TARBALL=true
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
