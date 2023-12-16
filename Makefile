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

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.log
	rm -rf artifacts/*.env
