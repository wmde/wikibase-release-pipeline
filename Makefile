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

mediawiki:
	bash update_cache.sh core skins
	eval ". ./build/build_mediawiki.sh; bash build/build_mediawiki_docker.sh ${MEDIAWIKI_IMAGE_NAME}"

wikibase:
	bash update_cache.sh extensions
	eval ". ./build/build_wikibase.sh; bash build/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME}"

queryservice:
	eval ". ./build/build_queryservice.sh; bash build/build_queryservice_docker.sh ${QUERYSERVICE_IMAGE_NAME}"

queryservice-ui:
	bash update_cache.sh services
	eval ". ./build/build_queryservice_ui.sh; bash build/build_queryservice_ui_docker.sh ${QUERYSERVICE_UI_IMAGE_NAME}"

oauth: 
	bash update_cache.sh extensions
	bash build/build_extension.sh OAuth ${WIKIBASE_BRANCH_NAME}

scribunto: 
	bash update_cache.sh extensions
	bash build/build_extension.sh Scribunto ${WIKIBASE_BRANCH_NAME}

clean-cache:
	rm -rf cache/*
	rm -rf git_cache/*

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.env

all: mediawiki oauth scribunto wikibase queryservice queryservice-ui