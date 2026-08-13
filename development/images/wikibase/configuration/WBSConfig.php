<?php

# Image-owned WBS MediaWiki configuration entry point. External configuration
# owners should set MW_CONFIG_FILE to their own entry point rather than replace
# this file; replacing it does not disable WBS configuration preparation.

if ( !defined( 'MEDIAWIKI' ) ) {
	exit;
}

$wbsInstanceSettings = '/config/InstanceSettings.php';
if ( !is_readable( $wbsInstanceSettings ) ) {
	throw new RuntimeException( "$wbsInstanceSettings is required." );
}

require $wbsInstanceSettings;
require '/opt/wbs/WBSSettings.php';
require '/opt/wbs/ExtensionLoaders.php';

$wbsCustomSettings = '/config/LocalSettings.php';
if ( is_readable( $wbsCustomSettings ) ) {
	require $wbsCustomSettings;
}
