<?php

# JobRunner instance is assumed by default, so jobs on request is disabled
$wgJobRunRate = 0;

# File Uploads enabled by default
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

# Add configuration values here or above which should be set before extensions are loaded

# Load extensions if present, alphabetically ordered by filename
foreach (glob("LocalSettings.d/*.php") as $filename)
{
	include $filename;
}

##############################################################################
# End of generated LocalSettings.php
##############################################################################

# Add configuration values below which should be set after extensions are loaded
