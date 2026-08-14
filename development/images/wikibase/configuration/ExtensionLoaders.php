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
	'Math.php',
	'PageImages.php',
	'TextExtracts.php',
	'Cite.php',
	'WikiEditor.php',
	'CodeEditor.php',
	'SecureLinkFixer.php',
	'Thanks.php',
	'Poem.php',
	'TemplateData.php',
	'ParserFunctions.php',
	'MultimediaViewer.php',
	'SpamBlacklist.php',
	'Parsoid.php',
	'RevisionSlider.php',
	'TorBlock.php',
	'JsonConfig.php',
	'Kartographer.php',
	'TemplateSandbox.php',
	'CodeMirror.php',
	'AdvancedSearch.php',
	'WikiHiero.php',
	'TwoColConflict.php',
	'StopForumSpam.php',
	'MobileFrontend.php',
	'ConfirmAccount.php',
	'InviteSignup.php',
	'WikibaseLexeme.php',
	'Elastica.php',
	'CirrusSearch.php',
	'WikibaseCirrusSearch.php',
	'WikibaseLexemeCirrusSearch.php',
	'WikimediaLogin.php',
	'WikibaseSuite.php',
	'WikibaseEdtf.php',
];

$wbsExtensionDefaults = array_fill_keys( $wbsExtensionLoaders, true );
foreach ( [
	'WikibaseEdtf.php',
	'Math.php',
	'PageImages.php',
	'TextExtracts.php',
	'Cite.php',
	'WikiEditor.php',
	'CodeEditor.php',
	'SecureLinkFixer.php',
	'Thanks.php',
	'Poem.php',
	'TemplateData.php',
	'ParserFunctions.php',
	'MultimediaViewer.php',
	'SpamBlacklist.php',
	'Parsoid.php',
	'RevisionSlider.php',
	'TorBlock.php',
	'JsonConfig.php',
	'Kartographer.php',
	'TemplateSandbox.php',
	'CodeMirror.php',
	'AdvancedSearch.php',
	'WikiHiero.php',
	'TwoColConflict.php',
	'StopForumSpam.php',
	'MobileFrontend.php',
	'ConfirmAccount.php',
	'InviteSignup.php',
	'WikibaseLexeme.php',
	'WikibaseLexemeCirrusSearch.php',
] as $wbsDisabledByDefaultLoader ) {
	$wbsExtensionDefaults[$wbsDisabledByDefaultLoader] = false;
}
$wbsExtensionStatePath = '/config/WBSExtensions.json';
$wbsExtensionState = [];
if ( is_file( $wbsExtensionStatePath ) ) {
	$wbsExtensionState = json_decode( (string)file_get_contents( $wbsExtensionStatePath ), true );
	if ( !is_array( $wbsExtensionState ) ) {
		$wbsExtensionState = [];
	}
}
$wbsExtensionState += $wbsExtensionDefaults;
if ( empty( $wbsExtensionState['VisualEditor.php'] ) ) {
	$wbsExtensionState['DiscussionTools.php'] = false;
}
if ( !empty( $wbsExtensionState['DiscussionTools.php'] ) ) {
	$wbsExtensionState['Linter.php'] = true;
}

foreach ( $wbsExtensionLoaders as $wbsExtensionLoader ) {
	if ( !empty( $wbsExtensionState[$wbsExtensionLoader] ) ) {
		require "/opt/wbs/extension-loaders/$wbsExtensionLoader";
	}
}

unset(
	$wbsExtensionDefaults,
	$wbsDisabledByDefaultLoader,
	$wbsExtensionLoader,
	$wbsExtensionLoaders,
	$wbsExtensionState,
	$wbsExtensionStatePath
);
