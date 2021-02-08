#!/bin/bash
# Install extra things for client-repo relationship
set -ex

# Add sites 
# client
php /var/www/html/maintenance/addSite.php --conf LocalSettings.php --wiki client_wiki  --pagepath=http://wikibase.svc/wiki/\$1  --filepath=http://wikibase.svc/w/\$1 --language en --interwiki-id my_wiki my_wiki mywikigroup

# Add interwiki links
# insert interwiki link to repo on client 
echo "INSERT INTO \`interwiki\` (\`iw_prefix\`, \`iw_url\`, \`iw_api\`, \`iw_wikiid\`, \`iw_local\`, \`iw_trans\`) VALUES ('my_wiki', 'http://wikibase.svc/wiki/\$1', 'http://wikibase.svc/w/api.php', '', '1', '0')" >> /tmp/client.sql
php /var/www/html/maintenance/patchSql.php --wiki=client_wiki /tmp/client.sql

# startup jobs
php /var/www/html/maintenance/runJobs.php --wiki client_wiki --wait &