<?php

namespace MediaWiki\Extension\WikibaseSuite;

class Hooks {
	public static function onSoftwareInfo( &$software ): bool {
		$wikibaseImageVersion = getenv( 'WIKIBASE_IMAGE_VERSION' );
		if ( $wikibaseImageVersion === false || trim( (string)$wikibaseImageVersion ) === '' ) {
			$wikibaseImageVersion = 'unknown';
		}

		$software['[https://www.mediawiki.org/wiki/Wikibase/Suite Wikibase Suite Docker Image]'] = trim(
			(string)$wikibaseImageVersion
		);

		$wbsVersion = getenv( 'WBS_VERSION' );
		if ( $wbsVersion !== false && trim( (string)$wbsVersion ) !== '' ) {
			$software['[https://www.mediawiki.org/wiki/Wikibase/Suite Wikibase Suite]'] = trim(
				(string)$wbsVersion
			);
		}

		$wbsToolsImage = getenv( 'WBS_TOOLS_IMAGE' );
		if ( $wbsToolsImage !== false && trim( (string)$wbsToolsImage ) !== '' ) {
			$software['[https://www.mediawiki.org/wiki/Wikibase/Suite Wikibase Suite Tools]'] = trim(
				(string)$wbsToolsImage
			);
		}

		return true;
	}
}
