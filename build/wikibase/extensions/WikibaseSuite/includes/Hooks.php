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

		$buildToolsSha = getenv( 'BUILD_TOOLS_GIT_SHA' );
		if ( $buildToolsSha !== false && trim( (string)$buildToolsSha ) !== '' ) {
			$software['[https://github.com/wmde/wikibase-release-pipeline Wikibase Suite Build Tools]'] = trim(
				(string)$buildToolsSha
			);
		}

		$deployVersion = getenv( 'DEPLOY_VERSION' );
		if ( $deployVersion !== false && trim( (string)$deployVersion ) !== '' ) {
			$software['[https://www.mediawiki.org/wiki/Wikibase/Suite/Deploy Wikibase Suite Deploy]'] = trim(
				(string)$deployVersion
			);
		}

		return true;
	}
}
