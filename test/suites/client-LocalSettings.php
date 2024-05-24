<?php

$wgMetaNamespace = "Project";

$wgEnableWikibaseRepo = false;
$wgEnableWikibaseClient = true;

wfLoadExtension( 'WikibaseClient', "$IP/extensions/Wikibase/extension-client.json" );
require_once "$IP/extensions/Wikibase/client/ExampleSettings.php";

$entitySources = [
    'repo' => [
        'entityNamespaces' => [ 'item' => 120, 'property' => 122 ],
        'repoDatabase' => 'my_wiki',
        'baseUri' => 'http://wikibase/entity/',
        'interwikiPrefix' => 'my_wiki',
        'rdfNodeNamespacePrefix' => 'wd',
        'rdfPredicateNamespacePrefix' => '',
        'type' => 'db'
    ],
];
$wgWBClientSettings['entitySources'] = $entitySources;
$wgWBClientSettings['itemAndPropertySourceName'] = 'repo';

$wgWBClientSettings['repoUrl'] = 'http://wikibase';
$wgWBClientSettings['repoScriptPath'] = '/w';
$wgWBClientSettings['repoArticlePath'] = '/wiki/$1';
$wgWBClientSettings['siteLinkGroups'] = [ 'mywikigroup' ];
$wgWBClientSettings['siteGlobalID'] = 'client_wiki';

