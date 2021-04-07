<?php

// https://www.mediawiki.org/wiki/Extension:VisualEditor
## VisualEditor Extension
wfLoadExtension( 'VisualEditor' );
wfLoadExtension( 'Parsoid', 'vendor/wikimedia/parsoid/extension.json' );

$wgVirtualRestConfig['modules']['parsoid'] = array(
    'url' => 'http://' . $_ENV['WIKIBASE_HOST'] . $wgScriptPath . '/rest.php',
);