#!make
include .env
include variables.env

export

test:
	bash test_scripts/test_docker.sh

wikibase:
	bash update_cache.sh
	eval ". ./build_scripts/build_wikibase.sh; bash build_scripts/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME}"

queryservice:
	bash update_cache.sh
	eval ". ./build_scripts/build_queryservice.sh; bash build_scripts/build_queryservice_docker.sh ${QUERYSERVICE_IMAGE_NAME}"

queryservice-ui:
	bash update_cache.sh
	eval ". ./build_scripts/build_queryservice_ui.sh; bash build_scripts/build_queryservice_ui_docker.sh ${QUERYSERVICE_UI_IMAGE_NAME}"

all:
	make wikibase
	make queryservice
	make queryservice-ui