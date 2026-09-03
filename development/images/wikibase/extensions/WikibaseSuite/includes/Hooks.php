<?php

namespace MediaWiki\Extension\WikibaseSuite;

use OutputPage;
use Skin;

class Hooks {
	public static function onBeforePageDisplay( OutputPage $out, Skin $skin ): void {
		if ( $skin->getSkinName() !== 'vector-2022' ) {
			return;
		}

		$out->addModules( 'ext.wikibasesuite.vector2022' );
		if ( !$skin->getUser()->isRegistered() ) {
			$out->addModules( 'ext.wikibasesuite.pinAnonymousMainMenu' );
		}
	}

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

	public static function onSidebarBeforeOutput( Skin $skin, array &$sidebar ): void {
		$quickStatementsUrl = getenv( 'QUICKSTATEMENTS_PUBLIC_URL' );
		$queryServiceUrl = getenv( 'WDQS_PUBLIC_FRONTEND_URL' );

		$wikibaseLinks = [
			[
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-create-item' )->text(),
				'href' => '/wiki/Special:NewItem',
				'id'   => 'n-wbs-link-one',
			],
			[
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-create-property' )->text(),
				'href' => '/wiki/Special:NewProperty',
				'id'   => 'n-wbs-link-two',
			],
			[
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-all-items' )->text(),
				'href' => '/wiki/Special:AllPages?namespace=120',
				'id'   => 'n-wbs-link-three',
			],
			[
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-all-properties' )->text(),
				'href' => '/wiki/Special:ListProperties',
				'id'   => 'n-wbs-link-four',
			],
		];

		if ( is_string( $quickStatementsUrl ) && $quickStatementsUrl !== '' ) {
			$wikibaseLinks[] = [
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-quickstatements' )->text(),
				'href' => $quickStatementsUrl,
				'id'   => 'n-wbs-link-five',
			];
		}

		$wikibaseLinks[] = [
				'text' => $skin->msg( 'wikibasesuite-sidebar-link-sparql-query-service' )->text(),
				'href' => $queryServiceUrl,
				'id'   => 'n-wbs-link-six',
			];

		$newSidebar = [];
		foreach ( $sidebar as $key => $value ) {
			if ( $key === 'TOOLBOX' || $key === 'SEARCH' ) {
				$newSidebar['wikibase-suite-sidebar'] = $wikibaseLinks;
			}
			$newSidebar[$key] = $value;
		}
		if ( !isset( $newSidebar['wikibase-suite-sidebar'] ) ) {
			$newSidebar['wikibase-suite-sidebar'] = $wikibaseLinks;
		}

		$sidebar = $newSidebar;
	}
}
