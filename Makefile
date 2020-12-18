#!make
include .env
export

test:
	bash test_scripts/test_docker.sh

mediawiki:
	bash update_cache.sh core skins
	eval ". ./build_scripts/build_mediawiki.sh; bash build_scripts/build_mediawiki_docker.sh ${MEDIAWIKI_IMAGE_NAME}"

wikibase:
	bash update_cache.sh extensions
	eval ". ./build_scripts/build_wikibase.sh; bash build_scripts/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME}"

queryservice:
	eval ". ./build_scripts/build_queryservice.sh; bash build_scripts/build_queryservice_docker.sh ${QUERYSERVICE_IMAGE_NAME}"

queryservice-ui:
	eval ". ./build_scripts/build_queryservice_ui.sh; bash build_scripts/build_queryservice_ui_docker.sh ${QUERYSERVICE_UI_IMAGE_NAME}"

all: mediawiki wikibase queryservice queryservice-ui