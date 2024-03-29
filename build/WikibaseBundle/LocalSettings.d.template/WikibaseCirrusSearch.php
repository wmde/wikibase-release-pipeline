<?php

if ( getenv('MW_ELASTIC_HOST') !== false ) {
    // https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch
    wfLoadExtension( 'WikibaseCirrusSearch' );

    $wgCirrusSearchServers = [ $_ENV['MW_ELASTIC_HOST'] ];
    $wgSearchType = 'CirrusSearch';
    $wgCirrusSearchExtraIndexSettings['index.mapping.total_fields.limit'] = 5000;
    $wgWBCSUseCirrus = true;
}
