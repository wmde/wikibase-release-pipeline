<?php

if (!getenv('JOBRUNNER')) {
  $mediawiki_host = getenv('MW_WG_SERVER');
  if (!$mediawiki_host) {
    throw new Exception("environment variable MW_WG_SERVER not set");
  }

  $wdqs_host = getenv('WDQS_PUBLIC_URL');
  if (!$wdqs_host) {
    throw new Exception("environment variable WDQS_PUBLIC_URL not set");
  }

  $wgWbManifestExternalServiceMapping = [
    'queryservice_ui' => getenv('WDQS_PUBLIC_URL'),
    'queryservice' => getenv('WDQS_PUBLIC_URL').'/sparql',
    'quickstatements' => getenv('MW_WG_SERVER').'/tools/quickstatements',
  ];
}

