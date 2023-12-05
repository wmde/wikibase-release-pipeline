#!make
include variables.env
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
	@bash test/scripts/test_suite.sh ${SUITE}
else
	@make test-all
endif

.PHONY: test-upgrade
test-upgrade:
ifndef GITHUB_ACTIONS
	-@make lint
endif
	@bash test/scripts/test_upgrade.sh ${VERSION}

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
	@bash test/scripts/test_suite.sh repo
	@bash test/scripts/test_suite.sh fedprops
	@bash test/scripts/test_suite.sh repo_client
	@bash test/scripts/test_suite.sh quickstatements
	@bash test/scripts/test_suite.sh pingback
	@bash test/scripts/test_suite.sh confirm_edit
	@bash test/scripts/test_suite.sh elasticsearch

	@# base tests
	@bash test/scripts/test_suite.sh base__repo
	@bash test/scripts/test_suite.sh base__repo_client
	@bash test/scripts/test_suite.sh base__fedprops
	@bash test/scripts/test_suite.sh base__pingback

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.log
	rm -rf artifacts/*.env
