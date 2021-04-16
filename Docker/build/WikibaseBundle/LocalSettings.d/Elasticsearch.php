<?php

# ElasticSearch related extensions
wfLoadExtension( 'Elastica' );
wfLoadExtension( 'CirrusSearch' );
wfLoadExtension( 'WikibaseCirrusSearch' );

$wgCirrusSearchServers = getenv('MW_ELASTIC_HOST') !== false ? [ $_ENV['MW_ELASTIC_HOST'] ] : [];
$wgSearchType = 'CirrusSearch';
$wgCirrusSearchExtraIndexSettings['index.mapping.total_fields.limit'] = 5000;
$wgWBCSUseCirrus = true;