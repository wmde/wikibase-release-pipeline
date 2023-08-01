#!/usr/bin/env bash
# Install extra things for client-repo relationship
set -ex

# Add sites
# client
php /var/www/html/maintenance/addSite.php --conf LocalSettings.php --wiki client_wiki  --pagepath=http://$WIKIBASE_HOST/wiki/\$1  --filepath=http://$WIKIBASE_HOST/w/\$1 --language en --interwiki-id my_wiki my_wiki mywikigroup
