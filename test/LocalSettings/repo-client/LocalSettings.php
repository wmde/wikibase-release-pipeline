<?php

error_reporting( -1 );
ini_set( 'display_errors', 1 );
$wgShowExceptionDetails = true;
$wgShowSQLErrors = true;
$wgDebugDumpSql  = true;
$wgShowDBErrorBacktrace = true;

$wgWBRepoSettings['siteLinkGroups'] = [ 'mywikigroup' ];
$wgLocalDatabases = $wgWBRepoSettings['localClientDatabases'] = [ 'client_wiki', ];

$wgEnableParserCache = false;
$wgCachePages = false;
$wgParserCacheType = CACHE_NONE;
$wgMainCacheType = CACHE_NONE;
