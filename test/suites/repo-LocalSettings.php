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
$wgDebugLogFile = '/var/log/mediawiki/mw.repo.debug.log';
$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/mw.repo.resourceloader.log',
	'exception' => '/var/log/mediawiki/mw.repo.exception.log',
	'error' => '/var/log/mediawiki/mw.repo.error.log',
	'fatal' => '/var/log/mediawiki/mw.repo.fatal.log',
);

## Site Settings
$wgMetaNamespace = "Project";

# Configured web paths & short URLs
# This allows use of the /wiki/* path
## https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "/w";        // this should already have been configured this way
$wgArticlePath = "/wiki/$1";

wfLoadSkin( 'Vector' );

$wgEnableWikibaseRepo = true;
$wgEnableWikibaseClient = false;

wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
require_once "$IP/extensions/Wikibase/repo/ExampleSettings.php";
$wgWBRepoSettings['siteLinkGroups'] = [ 'mywikigroup' ];
$wgLocalDatabases = $wgWBRepoSettings['localClientDatabases'] = [ 'client_wiki', ];

foreach (glob("LocalSettings.d/*.php") as $filename)
{
    include $filename;
}
