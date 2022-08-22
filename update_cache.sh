#!/bin/bash
set -e

function clone_if_not_present {
	REPOSITORY_CACHE_NAME=$1
	GIT_URL=$2
	if [ ! -d "git_cache/$1" ]; then
		git config --global --add safe.directory "$PWD/git_cache/$REPOSITORY_CACHE_NAME"
		git clone --mirror "$GIT_URL" "git_cache/$REPOSITORY_CACHE_NAME" -q
	fi
}

function fetch_all {
	REPOSITORY_CACHE_NAME=$1
	git config --global --add safe.directory "$PWD/git_cache/$REPOSITORY_CACHE_NAME"
	cd "git_cache/$REPOSITORY_CACHE_NAME"
	git fetch --all -q
	cd - > /dev/null
}

mkdir -p 'artifacts'
mkdir -p 'git_cache/skins/'
mkdir -p 'git_cache/services/'

cd "$(dirname "$0")"

skins=("Vector")
extensions=( \
		"Babel" \
		"CirrusSearch" \
		"cldr" \
		"ConfirmEdit" \
		"Elastica" \
		"EntitySchema"
		"Nuke" \
		"OAuth" \
		"Scribunto" \
		"SyntaxHighlight_GeSHi" \
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

	elif [ "$arg" = "base" ]; then
			clone_if_not_present "Wikibase.git" "https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase"
			fetch_all "Wikibase.git"
	elif [ "$arg" = "bundle" ]; then

		# WikibaseLocalMedia
		clone_if_not_present WikibaseLocalMedia.git https://github.com/ProfessionalWiki/WikibaseLocalMedia.git
		fetch_all WikibaseLocalMedia.git

		# WikibaseEdtf
		clone_if_not_present WikibaseEdtf.git https://github.com/ProfessionalWiki/WikibaseEdtf.git
		fetch_all WikibaseEdtf.git

		for extension in "${extensions[@]}"; do
			clone_if_not_present "$extension.git" "https://gerrit.wikimedia.org/r/mediawiki/extensions/$extension"
			fetch_all "$extension.git"
		done
	elif [ "$arg" = "services" ]; then
		# wdqs-frontend
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
