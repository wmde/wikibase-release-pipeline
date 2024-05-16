<?php

// JobRunner instance is assumed by default, so jobs on request is disabled
$wgJobRunRate = 0;

// File Uploads enabled by default
$wgEnableUploads = true;

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

# An optional LocalSettings.override.php
$localSettingsOverrideFile = "/config/LocalSettings.override.php";
if (file_exists($localSettingsOverrideFile)) {
	include $localSettingsOverrideFile;
}
