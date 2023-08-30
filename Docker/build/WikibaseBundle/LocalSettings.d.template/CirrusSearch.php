<?php

if ( getenv('MW_ELASTIC_HOST') !== false ) {
  // https://www.mediawiki.org/wiki/Extension:CirrusSearch
  wfLoadExtension( 'CirrusSearch' );

  // See WikibaseCirrusSearch.php for further configuration
}
