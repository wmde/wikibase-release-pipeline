#!/bin/bash

git clone --depth 1 --branch $1 https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase
cd Wikibase
composer install --no-dev
cd ../
tar -cvzf Wikibase.tar.gz ./Wikibase
