#!make
include variables.env
include .env
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
	bash test/test_suite.sh pingback
	bash test/test_suite.sh confirm-edit
	bash test/test_suite.sh elasticsearch

requirements:
	python3 build/requirements/build_version_requirements.py

mediawiki:
	bash update_cache.sh core skins
	eval ". ./build/build_mediawiki.sh; bash build/build_mediawiki_docker.sh ${MEDIAWIKI_IMAGE_NAME}"

wikibase:
	bash update_cache.sh base
	eval ". ./build/build_wikibase.sh; bash build/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME}"

wikibase_bundle:
	bash update_cache.sh bundle
	bash build/build_wikibase_bundle_docker.sh ${WIKIBASE_IMAGE_NAME} ${WIKIBASE_BUNDLE_IMAGE_NAME}

quickstatements:
	bash update_cache.sh services
	eval ". ./build/build_quickstatements.sh; bash build/build_quickstatements_docker.sh ${QUICKSTATEMENTS_IMAGE_NAME}"

wdqs:
	eval ". ./build/build_wdqs.sh; bash build/build_wdqs_docker.sh ${WDQS_IMAGE_NAME}"

wdqs-proxy:
	bash build/build_wdqs_proxy_docker.sh ${WDQS_PROXY_IMAGE_NAME}

wdqs-frontend:
	bash update_cache.sh services
	eval ". ./build/build_wdqs_frontend.sh; bash build/build_wdqs_frontend_docker.sh ${WDQS_FRONTEND_IMAGE_NAME}"

elasticsearch:
	bash build/build_elasticsearch_docker.sh ${ELASTICSEARCH_IMAGE_NAME}

clean-cache:
	rm -rf cache/*
	rm -rf git_cache/*

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.env

all: mediawiki wikibase wikibase_bundle elasticsearch wdqs wdqs-frontend wdqs-proxy quickstatements
