#!/usr/bin/env bash
# Install extra things for client-repo relationship
set -ex

# Add sites 
# client
php /var/www/html/maintenance/addSite.php --conf LocalSettings.php --wiki client_wiki  --pagepath=http://wikibase/wiki/\$1  --filepath=http://wikibase/w/\$1 --language en --interwiki-id my_wiki my_wiki mywikigroup

# startup jobs
php /var/www/html/maintenance/runJobs.php --wiki client_wiki --wait &
