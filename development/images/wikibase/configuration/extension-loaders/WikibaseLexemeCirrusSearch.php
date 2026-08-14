<?php

if ( isset( $elasticsearchHost ) ) {
	wfLoadExtension( 'WikibaseLexemeCirrusSearch' );
	$wgLexemeUseCirrus = true;
	$wgContentNamespaces[] = 146;
	$wgWBRepoSettings['searchIndexTypes'][] = 'wikibase-lexeme';
	$wgWBRepoSettings['searchIndexTypes'][] = 'wikibase-form';
	$wgWBRepoSettings['searchIndexTypes'][] = 'wikibase-sense';
}
