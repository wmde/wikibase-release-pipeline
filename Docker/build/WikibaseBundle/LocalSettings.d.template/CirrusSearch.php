<?php

// https://www.mediawiki.org/wiki/Extension:CirrusSearch
if ( getenv('MW_ELASTIC_HOST') !== false ) {
    wfLoadExtension( 'CirrusSearch' );
}

// See WikibaseCirrusSearch.php for further configuration