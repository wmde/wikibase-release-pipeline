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

# NOTE: These should already be the default, but wasn't in testing. Perhaps the official MediaWiki base we
# base WBS Wikibase off of changes this.
$wgScriptPath = "/w";
$wgArticlePath = "/wiki/$1";

$wgServer = $_ENV['MW_WG_SERVER'];
$wgSiteName = $_ENV['MW_WG_SITENAME'];
$wgLanguageCode = $_ENV['MW_WG_LANGUAGE_CODE'];
$wgEnableUploads = $_ENV['MW_WG_ENABLE_UPLOADS'];
$wgJobRunRate = $_ENV['MW_WG_JOB_RUN_RATE'];

# Pingback
$wgWBRepoSettings['wikibasePingback'] = $_ENV['WIKIBASE_PINGBACK'];

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
