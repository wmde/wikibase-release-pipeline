<?php

if (getenv('MW_ELASTIC_HOST')) {
  // https://www.mediawiki.org/wiki/Extension:Elastica
  wfLoadExtension( 'Elastica' );

  // See WikibaseCirrusSearch.php for further configuration
}
