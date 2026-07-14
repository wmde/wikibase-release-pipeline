#!/usr/bin/env bash

set -eu

page_title='Project:SPARQL/examples'

if php /var/www/html/maintenance/pageExists.php "$page_title"; then
    echo "Query examples page already exists."
    exit 0
fi

php /var/www/html/maintenance/edit.php \
    --summary 'Create query examples page' \
    --createonly \
    "$page_title" <<'EOF'
This page contains SPARQL query examples for this Wikibase.

Add examples with the <code>&lt;sparql&gt;</code> tag.
EOF
