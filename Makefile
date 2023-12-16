#!make
include variables.env
-include local.env

export

.PHONY: download
download:
	bash publish/download.sh

clean:
	rm -rf artifacts/*.tar.gz
	rm -rf artifacts/*.log
	rm -rf artifacts/*.env
