#!make
include .env
include variables.env
-include local.env

export

.PHONY: test
test:
	bash test/test_suite.sh ${SUITE}

test-all:
	bash test/test_suite.sh repo
	bash test/test_suite.sh fedprops
	bash test/test_suite.sh repo-client
	bash test/test_suite.sh quickstatements

mediawiki:
	bash update_cache.sh core skins
	eval ". ./build/build_mediawiki.sh; bash build/build_mediawiki_docker.sh ${MEDIAWIKI_IMAGE_NAME}"

wikibase:
	bash update_cache.sh extensions
	eval ". ./build/build_wikibase.sh; bash build/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME}"

wikibase_bundle:
	bash update_cache.sh extensions
	bash build/build_wikibase_bundle_docker.sh ${WIKIBASE_IMAGE_NAME} ${WIKIBASE_BUNDLE_IMAGE_NAME}

quickstatements:
	bash update_cache.sh services
	eval ". ./build/build_quickstatements.sh; bash build/build_quickstatements_docker.sh ${QUICKSTATEMENTS_IMAGE_NAME}"

queryservice:
	eval ". ./build/build_queryservice.sh; bash build/build_queryservice_docker.sh ${QUERYSERVICE_IMAGE_NAME}"

queryservice-ui:
	bash update_cache.sh services
	eval ". ./build/build_queryservice_ui.sh; bash build/build_queryservice_ui_docker.sh ${QUERYSERVICE_UI_IMAGE_NAME}"

elasticsearch:
	bash build/build_elasticsearch_docker.sh ${ELASTICSEARCH_IMAGE_NAME}

clean-cache:
	rm -rf cache/*
	rm -rf git_cache/*

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.env

all: mediawiki wikibase wikibase_bundle elasticsearch queryservice queryservice-ui quickstatements
