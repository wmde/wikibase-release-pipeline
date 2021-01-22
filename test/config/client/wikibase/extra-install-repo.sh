#!/bin/bash
# Install extra things for client-repo relationship
set -ex

# Add sites 
# repo
php /var/www/html/maintenance/addSite.php --wiki my_wiki --conf LocalSettings.php  --pagepath=http://wikibase-client.svc/wiki/\$1  --filepath=http://wikibase-client.svc/w/\$1 --language en --interwiki-id client_wiki client_wiki mywikigroup

# Add interwiki links
# insert interwiki link to client on repo
echo "INSERT INTO \`interwiki\` (\`iw_prefix\`, \`iw_url\`, \`iw_api\`, \`iw_wikiid\`, \`iw_local\`, \`iw_trans\`) VALUES ('client_wiki', 'http://wikibase-client.svc/wiki/\$1', 'http://wikibase-client.svc/w/api.php', '', '1', '0')" >> /tmp/repo.sql
php /var/www/html/maintenance/patchSql.php --wiki=my_wiki /tmp/repo.sql

## run dispatcher
php /var/www/html/extensions/Wikibase/repo/maintenance/dispatchChanges.php --wiki my_wiki --idle-delay 2 --dispatch-interval 2 --client client_wiki &

# startup jobs
php /var/www/html/maintenance/runJobs.php --wiki my_wiki --wait &