#!make
include variables.env
-include builder_configuration.env
-include local.env

export

.PHONY: download
download:
	bash publish/download.sh

.PHONY: test
test: test-stop
	bash test/test_suite.sh ${SUITE}

.PHONY: test-upgrade
test-upgrade: upgrade-stop
	bash test/test_upgrade.sh ${VERSION} ${TO_VERSION}

.PHONY: test-example
test-example: example-stop
	bash test/test_example.sh ${SUITE}

.PHONY: test-stop
test-stop:
	cd test && bash test_stop.sh "$(ARGS_CONFIG)"

.PHONY: upgrade-stop
upgrade-stop:
	make test-stop ARGS_CONFIG="--env-file upgrade/default_variables.env -f docker-compose.upgrade.yml -f docker-compose.upgrade.wdqs.yml"

.PHONY: example-stop
example-stop:
	make test-stop ARGS_CONFIG="--env-file ../example/template.env -f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml"

test-all:
	# bundle tests
	bash test/test_suite.sh repo
	bash test/test_suite.sh fedprops
	bash test/test_suite.sh repo_client
	bash test/test_suite.sh quickstatements
	bash test/test_suite.sh pingback
	bash test/test_suite.sh confirm_edit
	bash test/test_suite.sh elasticsearch

	# base tests
	bash test/test_suite.sh base__repo
	bash test/test_suite.sh base__repo_client
	bash test/test_suite.sh base__fedprops
	bash test/test_suite.sh base__pingback

requirements:
	python3 build/requirements/build_version_requirements.py
	cat artifacts/built_versions.log

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
	rm -rf artifacts/*.log
	rm -rf artifacts/*.env

all: wikibase wikibase_bundle elasticsearch wdqs wdqs-frontend wdqs-proxy quickstatements
