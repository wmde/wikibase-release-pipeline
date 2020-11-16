#!/bin/bash

cd "$(dirname "$0")"

extensions=("Wikibase")

for extension in "${extensions[@]}"; do
	if [ ! -d "git_cache/$extension.git" ]; then
		git clone --bare "https://gerrit.wikimedia.org/r/mediawiki/extensions/$extension.git" "git_cache/$extension.git"
	fi
	cd "git_cache/$extension.git"
	git fetch --all
	cd -
done