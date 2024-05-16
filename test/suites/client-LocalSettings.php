<?php

ini_set( 'display_errors', 1 );
$wgShowExceptionDetails = true;
$wgShowSQLErrors = true;
$wgDebugDumpSql  = false;
$wgShowDBErrorBacktrace = false;
$wgEnableParserCache = false;
$wgCachePages = false;
$wgParserCacheType = CACHE_NONE;
$wgMainCacheType = CACHE_NONE;

## Logs
## Save these logs inside the container
$wgDebugLogFile = '/var/log/mediawiki/mw.client.debug.log';
$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/mw.client.resourceloader.log',
	'exception' => '/var/log/mediawiki/mw.client.exception.log',
	'error' => '/var/log/mediawiki/mw.client.error.log',
	'fatal' => '/var/log/mediawiki/mw.client.fatal.log',
);

## Site Settings
$wgMetaNamespace = "Project";

# Configured web paths & short URLs
# This allows use of the /wiki/* path
## https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "/w";        // this should already have been configured this way
$wgArticlePath = "/wiki/$1";

wfLoadSkin( 'Vector' );

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

foreach (glob("LocalSettings.d/*.php") as $filename)
{

	if (strpos($filename, 'CirrusSearch') !== false) {
		continue;
	}

	if (strpos($filename, 'EntitySchema') !== false) {
		continue;
	}

	if (strpos($filename, 'Elastic') !== false) {
		continue;
	}

	if (strpos($filename, 'WikibaseCirrusSearch') !== false) {
		continue;
	}

	if (strpos($filename, 'WikibaseLocalMedia') !== false) {
		continue;
	}

	if (strpos($filename, 'WikibaseEdtf') !== false) {
		continue;
	}

    include $filename;
}
