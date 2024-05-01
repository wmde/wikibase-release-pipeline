<?php

# Logs
# TODO: Explore simply logging to stdout/stderr so these appear in Docker logs
$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/mw.resourceloader.log',
	'exception' => '/var/log/mediawiki/mw.exception.log',
	'error' => '/var/log/mediawiki/mw.error.log',
	'fatal' => '/var/log/mediawiki/mw.fatal.log',
);
$wgDebugLogFile = '/var/log/mediawiki/mw.debug.log';

$wgArticlePath = "/wiki/$1";

if (isset($_ENV['MW_WG_SERVER'])) {
	$wgServer = $_ENV['MW_WG_SERVER'];
}
if (isset($_ENV['MW_WG_SITENAME'])) {
	$wgSiteName = $_ENV['MW_WG_SITENAME'];
}
if (isset($_ENV['MW_WG_LANGUAGE_CODE'])) {
	$wgLanguageCode = $_ENV['MW_WG_LANGUAGE_CODE'];
}
if (isset($_ENV['MW_WG_ENABLE_UPLOADS'])) {
	$wgEnableUploads = $_ENV['MW_WG_ENABLE_UPLOADS'];
}
if (isset($_ENV['MW_WG_ENABLE_UPLOADS'])) {
	$wgJobRunRate = $_ENV['MW_WG_JOB_RUN_RATE'];
}
if (isset($_ENV['WIKIBASE_PINGBACK'])) {
	$wgWBRepoSettings['wikibasePingback'] = $_ENV['WIKIBASE_PINGBACK'];
}

# Wikibase Repository
wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
require_once "$IP/extensions/Wikibase/repo/ExampleSettings.php";

# Wikibase Client
wfLoadExtension( 'WikibaseClient', "$IP/extensions/Wikibase/extension-client.json" );
require_once "$IP/extensions/Wikibase/client/ExampleSettings.php";

# Load extensions if present, alphabetically ordered by filename  
foreach (glob("LocalSettings.d/*.php") as $filename)
{
    include $filename;
}
