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

## Site Settings
$wgMetaNamespace = "Project";

$wgEnableWikibaseRepo = true;
$wgEnableWikibaseClient = false;

wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
require_once "$IP/extensions/Wikibase/repo/ExampleSettings.php";
$wgWBRepoSettings['siteLinkGroups'] = [ 'mywikigroup' ];
$wgLocalDatabases = $wgWBRepoSettings['localClientDatabases'] = [ 'client_wiki', ];
