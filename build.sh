#!/bin/bash

git clone --depth 1 --branch $1 ssh://gerrit.wikimedia.org:29418/mediawiki/extensions/Wikibase
cd Wikibase
composer install --no-dev
cd ../
tar -cvzf Wikibase.tar.gz ./Wikibase
