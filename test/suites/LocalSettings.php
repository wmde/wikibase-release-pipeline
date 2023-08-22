<?php
ini_set( 'display_errors', 1 );
$wgShowExceptionDetails = true;
$wgShowSQLErrors = true;
$wgDebugDumpSql  = false;
$wgShowDBErrorBacktrace = false;
$wgDebugLogFile = '/var/log/mediawiki/mw.debug.log';

$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/mw.resourceloader.log',
	'exception' => '/var/log/mediawiki/mw.exception.log',
	'error' => '/var/log/mediawiki/mw.error.log',
	'fatal' => '/var/log/mediawiki/mw.fatal.log',
);
