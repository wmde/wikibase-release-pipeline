#!/bin/bash
# Install extra things for client-repo relationship
set -ex

# Add sites 
# repo
php /var/www/html/maintenance/addSite.php --wiki my_wiki --conf LocalSettings.php  --pagepath=http://wikibase-client.svc/wiki/\$1  --filepath=http://wikibase-client.svc/w/\$1 --language en --interwiki-id client_wiki client_wiki mywikigroup

# startup jobs
php /var/www/html/maintenance/runJobs.php --wiki my_wiki --wait &