<?php

error_reporting( -1 );
ini_set( 'display_errors', 1 );
$wgShowExceptionDetails = true;
$wgShowSQLErrors = true;
$wgDebugDumpSql  = true;
$wgShowDBErrorBacktrace = true;

$wgWBRepoSettings['federatedPropertiesEnabled'] = true;

/**
 *  Manually setup the default federated properties entitySources
 *  The following can be removed once we drop support for 1.35
 */
$wgWBRepoSettings['federatedPropertiesSourceScriptUrl'] = 'https://www.wikidata.org/w/';
$wgWBRepoSettings['entitySources'] = [
    'local' => [
        'entityNamespaces' => [ 'item' => 120 ],
        'repoDatabase' => false,
        'baseUri' => 'http://wikibase.svc/entity/',
        'interwikiPrefix' => '',
        'rdfNodeNamespacePrefix' => 'wd',
        'rdfPredicateNamespacePrefix' => 'wdt',
    ],
    'fedprops' => [
        'entityNamespaces' => [ 'property' => 122 ],
        'repoDatabase' => false,
        'baseUri' => 'http://www.wikidata.org/entity/',
        'interwikiPrefix' => 'wikidata',
        'rdfNodeNamespacePrefix' => 'fpwd',
        'rdfPredicateNamespacePrefix' => 'fpwd',
    ],
];