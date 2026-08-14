<?php

namespace MediaWiki\Extension\WikibaseSuite;

use MediaWiki\Registration\ExtensionRegistry;
use OutputPage;
use Skin;
use SpecialPage;

class Hooks {
	public static function onBeforePageDisplay( OutputPage $out, Skin $skin ): void {
		$authority = $skin->getAuthority();
		if (
			$authority->isRegistered()
			|| $skin->getSkinName() !== 'vector-2022'
			|| !$authority->isAllowed( 'edit' )
			|| !$authority->isAllowed( 'createpage' )
		) {
			return;
		}
		$out->addModules( 'ext.wikibasesuite.pinAnonymousMainMenu' );
	}

	public static function onSidebarBeforeOutput( Skin $skin, array &$sidebar ): void {
		$authority = $skin->getAuthority();
		$wikibaseLinks = [];
		if ( ExtensionRegistry::getInstance()->isLoaded( 'WikibaseRepository' ) ) {
			$canCreateEntity = $authority->isAllowed( 'edit' )
				&& $authority->isAllowed( 'createpage' );
			if ( $canCreateEntity ) {
				$wikibaseLinks[] = self::sidebarLink(
					$skin,
					'wikibasesuite-create-new-item',
					SpecialPage::getTitleFor( 'NewItem' )->getLocalURL(),
					'n-wikibasesuite-create-new-item'
				);
			}
			if ( $canCreateEntity && $authority->isAllowed( 'property-create' ) ) {
				$wikibaseLinks[] = self::sidebarLink(
					$skin,
					'wikibasesuite-create-new-property',
					SpecialPage::getTitleFor( 'NewProperty' )->getLocalURL(),
					'n-wikibasesuite-create-new-property'
				);
			}

			$wikibaseLinks[] = self::sidebarLink(
				$skin,
				'wikibasesuite-all-items',
				SpecialPage::getTitleFor( 'AllPages' )->getLocalURL( [
					'namespace' => constant( 'WB_NS_ITEM' ),
				] ),
				'n-wikibasesuite-all-items'
			);
			$wikibaseLinks[] = self::sidebarLink(
				$skin,
				'wikibasesuite-all-properties',
				SpecialPage::getTitleFor( 'ListProperties' )->getLocalURL(),
				'n-wikibasesuite-all-properties'
			);
		}

		$queryServiceUrl = self::environmentUrl( 'WDQS_PUBLIC_FRONTEND_URL' );
		$quickStatementsUrl = self::environmentUrl( 'QUICKSTATEMENTS_PUBLIC_URL' );
		if ( $quickStatementsUrl !== null ) {
			$wikibaseLinks[] = self::sidebarLink(
				$skin,
				'wikibasesuite-quickstatements',
				$quickStatementsUrl,
				'n-wikibasesuite-quickstatements'
			);
		}
		if ( $queryServiceUrl !== null ) {
			$wikibaseLinks[] = self::sidebarLink(
				$skin,
				'wikibasesuite-query-service',
				$queryServiceUrl,
				'n-wikibasesuite-query-service'
			);
		}
		$sections = [];
		if ( $wikibaseLinks !== [] ) {
			$sections['wikibasesuite-wikibase-sidebar-heading'] = $wikibaseLinks;
		}

		if ( $authority->isAllowed( 'wbs-manage-instance' ) ) {
			$sections['wikibasesuite-sidebar-heading'] = [
				self::sidebarLink(
					$skin,
					'wikibasesuite-configure-instance',
					rtrim( (string)$skin->getConfig()->get( 'Server' ), '/' ) . '/tools/configure/',
					'n-wikibasesuite-configure-instance'
				),
			];
		}
		self::insertBeforeToolbox( $sidebar, $sections );
	}

	private static function insertBeforeToolbox( array &$sidebar, array $sections ): void {
		$toolboxPosition = array_search( 'TOOLBOX', array_keys( $sidebar ), true );
		if ( $toolboxPosition === false ) {
			$sidebar += $sections;
			return;
		}
		$sidebar = array_slice( $sidebar, 0, $toolboxPosition, true )
			+ $sections
			+ array_slice( $sidebar, $toolboxPosition, null, true );
	}

	private static function environmentUrl( string $name ): ?string {
		$value = getenv( $name );
		if ( $value === false || trim( (string)$value ) === '' ) {
			return null;
		}
		return trim( (string)$value );
	}

	private static function sidebarLink(
		Skin $skin,
		string $message,
		string $href,
		string $id
	): array {
		return [
			'text' => $skin->msg( $message )->text(),
			'href' => $href,
			'id' => $id,
		];
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
}
