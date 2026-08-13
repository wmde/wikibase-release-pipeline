<?php

# Authoritative load order for extension loaders supplied by the image. Every
# file in /opt/wbs/extension-loaders must be registered below. A loader may
# conditionally configure or load one or more extensions. Extensions bundled in
# the image without a registered loader are disabled by default and can be
# enabled in the user-owned LocalSettings.php.
$wbsExtensionLoaders = [
	'Wikibase.php',
	'EntitySchema.php',
	'WikibaseLocalMedia.php',
	'WikibaseManifest.php',
	'WikibaseInWikitext.php',
	'Babel.php',
	'cldr.php',
	'ConfirmEdit.php',
	'Echo.php',
	'Nuke.php',
	'OAuth.php',
	'Scribunto.php',
	'SyntaxHighlight_GeSHi.php',
	'UniversalLanguageSelector.php',
	'VisualEditor.php',
	'Linter.php',
	'DiscussionTools.php',
	'Elastica.php',
	'CirrusSearch.php',
	'WikibaseCirrusSearch.php',
	'WikimediaLogin.php',
	'WikibaseSuite.php',
];

foreach ( $wbsExtensionLoaders as $wbsExtensionLoader ) {
	require "/opt/wbs/extension-loaders/$wbsExtensionLoader";
}

unset( $wbsExtensionLoader, $wbsExtensionLoaders );
