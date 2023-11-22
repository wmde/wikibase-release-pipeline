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
				--build-arg GIT_IMAGE="$GIT_IMAGE" \
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


for arg in "$@"; do
    case $arg in
        wikibase)
						build_wikibase
            ;;
        -b|--optionB)
						build_wikibase
            ;;
        *)
            echo "Unknown option: $arg"
						exit 2 # code appropriate?
            ;;
    esac
done
