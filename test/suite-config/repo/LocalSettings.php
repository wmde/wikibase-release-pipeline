<?php
error_reporting( -1 );
ini_set( 'display_errors', 1 );
$wgShowExceptionDetails = true;
$wgShowSQLErrors = true;
$wgDebugDumpSql  = true;
$wgShowDBErrorBacktrace = true;

## Scribunto
wfLoadExtension( 'Scribunto' );
$wgScribuntoDefaultEngine = 'luastandalone';

## OAuth Extension
wfLoadExtension( 'OAuth' );
$wgGroupPermissions['sysop']['mwoauthproposeconsumer'] = true;
$wgGroupPermissions['sysop']['mwoauthmanageconsumer'] = true;
$wgGroupPermissions['sysop']['mwoauthviewprivate'] = true;
$wgGroupPermissions['sysop']['mwoauthupdateownconsumer'] = true;