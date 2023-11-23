<?php

if ( getenv('MW_ELASTIC_HOST') !== false ) {
  // https://www.mediawiki.org/wiki/Extension:Elastica
  wfLoadExtension( 'Elastica' );

  // See WikibaseCirrusSearch.php for further configuration
}
