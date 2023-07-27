#!/usr/bin/env bash
# Install extra things for client-repo relationship
set -ex

# Add sites 
# repo
php /var/www/html/maintenance/addSite.php --wiki my_wiki --conf LocalSettings.php  --pagepath=http://$WIKIBASE_CLIENT_HOST/wiki/\$1  --filepath=http://$WIKIBASE_CLIENT_HOST/w/\$1 --language en --interwiki-id client_wiki client_wiki mywikigroup
