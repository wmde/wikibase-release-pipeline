<?php

use MediaWiki\CommentStore\CommentStoreComment;
use MediaWiki\Content\ContentHandler;
use MediaWiki\Maintenance\Maintenance;
use MediaWiki\Revision\SlotRecord;
use MediaWiki\Title\Title;
use MediaWiki\User\User;

require_once '/var/www/html/maintenance/Maintenance.php';

/**
 * Create the Wikibase Suite onboarding page during a fresh installation.
 *
 * MediaWiki creates its own Main Page before WBS runs its additional install
 * steps. That page may be replaced only while it is still the untouched,
 * single-revision page authored by the MediaWiki installer.
 */
class CreateBootstrapMainPage extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Create the initial Wikibase Suite Main Page.' );
		$this->addOption( 'user', 'Username for the bootstrap edit', false, true );
	}

	public function execute() {
		if ( !( $GLOBALS['wgEnableWikibaseRepo'] ?? true ) ) {
			$this->output( "Wikibase Repository is disabled; leaving the Main Page unchanged.\n" );
			return;
		}

		$title = Title::newFromText( wfMessage( 'mainpage' )->inContentLanguage()->text() );
		if ( !$title ) {
			$this->fatalError( 'The configured Main Page title is invalid.' );
		}

		$page = $this->getServiceContainer()->getWikiPageFactory()->newFromTitle( $title );
		if ( $page->exists() && !$this->isUntouchedInstallerPage( $title ) ) {
			$this->output( "Main Page already has instance content; leaving it unchanged.\n" );
			return;
		}

		$userName = $this->getOption( 'user', false );
		$user = $userName === false
			? User::newSystemUser( User::MAINTENANCE_SCRIPT_USER, [ 'steal' => true ] )
			: User::newFromName( $userName );
		if ( !$user ) {
			$this->fatalError( 'The bootstrap edit username is invalid.' );
		}
		if ( $user->isAnon() ) {
			$user->addToDatabase();
		}

		$contentPath = dirname( __DIR__ ) . '/resources/bootstrap-main-page.wikitext';
		$contentText = file_get_contents( $contentPath );
		if ( $contentText === false ) {
			$this->fatalError( "Could not read $contentPath." );
		}

		$updater = $page->newPageUpdater( $user );
		$updater->setContent(
			SlotRecord::MAIN,
			ContentHandler::makeContent( $contentText, $title )
		);
		$updater->saveRevision(
			CommentStoreComment::newUnsavedComment( 'Add the Wikibase Suite welcome page' )
		);
		$status = $updater->getStatus();
		if ( !$status->isGood() ) {
			$this->fatalError( $status );
		}
		$this->output( "Created the Wikibase Suite Main Page.\n" );
	}

	private function isUntouchedInstallerPage( Title $title ): bool {
		$revision = $this->getServiceContainer()
			->getRevisionLookup()
			->getRevisionByTitle( $title );
		if ( !$revision || $revision->getParentId() !== 0 ) {
			return false;
		}
		$author = $revision->getUser();
		return $author !== null && $author->getName() === 'MediaWiki default';
	}
}

$maintClass = CreateBootstrapMainPage::class;
require_once RUN_MAINTENANCE_IF_MAIN;
