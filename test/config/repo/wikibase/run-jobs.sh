#!/bin/bash
# Install extra things for repo
set -ex

# startup jobs
php /var/www/html/maintenance/runJobs.php --wiki my_wiki --wait &