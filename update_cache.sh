#!/bin/bash
set -ex

function clone_if_not_present {
	REPOSITORY_CACHE_NAME=$1
	GIT_URL=$2
	if [ ! -d "git_cache/$1" ]; then
		git clone --mirror "$GIT_URL" "git_cache/$REPOSITORY_CACHE_NAME"
	fi
}

function fetch_all {
	REPOSITORY_CACHE_NAME=$1
	cd "git_cache/$REPOSITORY_CACHE_NAME"
	git fetch --all
	cd -
}

mkdir -p 'artifacts'
mkdir -p 'git_cache/skins/'
mkdir -p 'git_cache/services/'

cd "$(dirname "$0")"

skins=("Vector")
extensions=( \
		"CirrusSearch" \
		"cldr" \
		"Elastica" \
		"EntitySchema"
		"OAuth" \
		"Scribunto" \
		"VisualEditor" \
		"UniversalLanguageSelector"
		"Wikibase" \
		"WikibaseCirrusSearch" \
		"WikibaseManifest" \
		)

for arg in "$@"; do

	if [ "$arg" = "skins" ]; then
		for skin in "${skins[@]}"; do
			clone_if_not_present "skins/$skin.git" "https://gerrit.wikimedia.org/r/mediawiki/skins/$skin"
			fetch_all "skins/$skin.git"
		done

	elif [ "$arg" = "extensions" ]; then
		for extension in "${extensions[@]}"; do
			clone_if_not_present "$extension.git" "https://gerrit.wikimedia.org/r/mediawiki/extensions/$extension"
			fetch_all "$extension.git"
		done
	elif [ "$arg" = "services" ]; then
		# queryservice
		clone_if_not_present "services/wikidata-query-gui.git" "https://gerrit.wikimedia.org/r/wikidata/query/gui"
		fetch_all "services/wikidata-query-gui.git"
		
		# quickstatements
		clone_if_not_present "services/quickstatements.git" https://github.com/magnusmanske/quickstatements
		fetch_all "services/quickstatements.git"

		# magnus tools
		clone_if_not_present "services/magnustools.git" https://bitbucket.org/magnusmanske/magnustools.git
		fetch_all "services/magnustools.git"

	elif [ "$arg" = "core" ]; then
		clone_if_not_present core.git "https://gerrit.wikimedia.org/r/mediawiki/core"
		fetch_all "core.git"
	fi
done
