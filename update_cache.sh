#!/bin/bash

cd "$(dirname "$0")"

# Initial clones, if needed
mkdir -p git_cache/mediawiki/skins
if [ ! -d git_cache/mediawiki/core.git ]; then
	git clone --bare https://gerrit.wikimedia.org/r/mediawiki/core git_cache/mediawiki/core.git
fi
if [ ! -d git_cache/mediawiki/vendor.git ]; then
	git clone --bare https://gerrit.wikimedia.org/r/mediawiki/vendor git_cache/mediawiki/vendor.git
fi
if [ ! -d git_cache/mediawiki/skins/Vector.git ]; then
	git clone --bare https://gerrit.wikimedia.org/r/mediawiki/skins/Vector git_cache/mediawiki/skins/Vector.git
fi

cd git_cache/mediawiki/core.git
git fetch --all
cd -

cd git_cache/mediawiki/vendor.git
git fetch --all
cd -

cd git_cache/mediawiki/skins/Vector.git
git fetch --all
cd -
