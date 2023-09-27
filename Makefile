#!make
include variables.env
-include builder_configuration.env
-include local.env

export

.PHONY: download
download:
	bash publish/download.sh

.PHONY: lint
lint:
	@bash test/scripts/lint.sh

.PHONY: lint-fix
lint-fix:
	@bash test/scripts/lint.sh -f

.PHONY: test
test:
ifdef SUITE
ifndef GITHUB_ACTIONS
	-@make lint
endif
	@bash test/scripts/test_suite.sh ${SUITE} ${CHANNEL}
else
	@make test-all
endif

.PHONY: test-upgrade
test-upgrade:
ifndef GITHUB_ACTIONS
	-@make lint
endif
	@bash test/scripts/test_upgrade.sh ${VERSION} ${TO_VERSION}

.PHONY: test-example
test-example:
ifndef GITHUB_ACTIONS
	-@make lint
endif
	@bash test/scripts/test_example.sh ${SUITE}

test-all:
ifndef GITHUB_ACTIONS
	-@make lint
endif
	@echo "\n⚠️  Running All Test Suites"

	@# bundle tests
	@bash test/scripts/test_suite.sh repo ${CHANNEL}
	@bash test/scripts/test_suite.sh fedprops ${CHANNEL}
	@bash test/scripts/test_suite.sh repo_client ${CHANNEL}
	@bash test/scripts/test_suite.sh quickstatements ${CHANNEL}
	@bash test/scripts/test_suite.sh pingback ${CHANNEL}
	@bash test/scripts/test_suite.sh confirm_edit ${CHANNEL}
	@bash test/scripts/test_suite.sh elasticsearch ${CHANNEL}

	@# base tests
	@bash test/scripts/test_suite.sh base__repo ${CHANNEL}
	@bash test/scripts/test_suite.sh base__repo_client ${CHANNEL}
	@bash test/scripts/test_suite.sh base__fedprops ${CHANNEL}
	@bash test/scripts/test_suite.sh base__pingback ${CHANNEL}

# TODO: https://phabricator.wikimedia.org/T347084
requirements:
	python3 build/requirements/build_version_requirements.py
	cat artifacts/built_versions.log

wikibase:
	bash update_cache.sh bundle
	eval ". ./build/build_wikibase.sh; bash build/build_wikibase_docker.sh ${WIKIBASE_IMAGE_NAME};bash build/build_wikibase_bundle_docker.sh ${WIKIBASE_IMAGE_NAME} ${WIKIBASE_BUNDLE_IMAGE_NAME}"

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

all: wikibase elasticsearch wdqs wdqs-frontend wdqs-proxy quickstatements
