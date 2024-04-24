<?php

# ------------------------------------------
# Wikibase Suite LocalSettings.php additions
# ------------------------------------------

## Database settings
# Environment variables will be substituted in here.
$wgDBserver = $_ENV['DB_SERVER'];
$wgDBname = $_ENV['DB_NAME'];
$wgDBuser = $_ENV['DB_USER'];
$wgDBpassword = $_ENV['DB_PASS'];

## Logs
# Save these logs inside the container
$wgDebugLogGroups = array(
	'resourceloader' => '/var/log/mediawiki/resourceloader.log',
	'exception' => '/var/log/mediawiki/exception.log',
	'error' => '/var/log/mediawiki/error.log',
	'fatal' => '/var/log/mediawiki/fatal.log',
);

## Site Settings
# TODO: This maybe should no longer be set this way (https://phabricator.wikimedia.org/T359025):
$wgServer = WebRequest::detectServer();
$wgShellLocale = "en_US.utf8";
$wgLanguageCode = $_ENV['MW_SITE_LANG'];
$wgSitename = $_ENV['MW_SITE_NAME'];
$wgMetaNamespace = "Project";

## Configured web paths & short URLs
# This allows use of the /wiki/* path
# https://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "/w";        // this should already have been configured this way
$wgArticlePath = "/wiki/$1";

## Set Secret
$wgSecretKey = $_ENV['MW_WG_SECRET_KEY'];

## RC Age
# https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge
# Items in the recentchanges table are periodically purged; entries older than this many seconds will go.
# The query service (by default) loads data from recent changes
# Set this to 1 year to avoid any changes being removed from the RC table over a shorter period of time.
$wgRCMaxAge = 365 * 24 * 3600;

wfLoadSkin( 'Vector' );

$wgJobRunRate = $_ENV['MW_WG_JOB_RUN_RATE'];
$wgEnableUploads = $_ENV['MW_WG_ENABLE_UPLOADS'];
$wgUploadDirectory = $_ENV['MW_WG_UPLOAD_DIRECTORY'];

## Pingback
$wgWBRepoSettings['wikibasePingback'] = $_ENV['WIKIBASE_PINGBACK'];

## Enables ConfirmEdit Captcha
#wfLoadExtension( 'ConfirmEdit/QuestyCaptcha' );
#$wgCaptchaQuestions = [
#  'What animal' => 'dog',
#];

#$wgCaptchaTriggers['edit']          = true;
#$wgCaptchaTriggers['create']        = true;
#$wgCaptchaTriggers['createtalk']    = true;
#$wgCaptchaTriggers['addurl']        = true;
#$wgCaptchaTriggers['createaccount'] = true;
#$wgCaptchaTriggers['badlogin']      = true;

## Disable UI error-reporting
#ini_set( 'display_errors', 0 );
