<?php

// Preserve database-backed MediaWiki sessions while update.php purges the
// objectcache table. The backup exists only inside the starting container and
// is removed immediately after the rows are restored.

require_once '/var/www/html/maintenance/Maintenance.php';

use MediaWiki\Maintenance\Maintenance;
use Wikimedia\Rdbms\LikeValue;

class PreserveSessions extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addArg( 'action', 'export or import' );
		$this->addArg( 'path', 'Temporary session backup path' );
	}

	public function execute() {
		$action = $this->getArg( 0 );
		$path = $this->getArg( 1 );
		if ( !in_array( $action, [ 'export', 'import' ], true ) ) {
			$this->fatalError( 'Action must be export or import.' );
		}

		$db = $this->getServiceContainer()
			->getConnectionProvider()
			->getPrimaryDatabase();

		if ( $action === 'export' ) {
			$cache = $this->getServiceContainer()
				->getObjectCacheFactory()
				->getInstance( CACHE_DB );
			$prefix = $cache->makeKey( 'MWSession' ) . ':';
			$result = $db->newSelectQueryBuilder()
				->select( [ 'keyname', 'value', 'exptime' ] )
				->from( 'objectcache' )
				->where(
					$db->expr(
						'keyname',
						'LIKE',
						new LikeValue( $prefix, $db->anyString() )
					)
				)
				->caller( __METHOD__ )
				->fetchResultSet();
			$rows = [];
			foreach ( $result as $row ) {
				$rows[] = [
					'keyname' => $row->keyname,
					'value' => base64_encode( $row->value ),
					'exptime' => $row->exptime,
				];
			}
			if ( file_put_contents( $path, json_encode( $rows, JSON_THROW_ON_ERROR ) ) === false ) {
				$this->fatalError( "Could not write session backup to $path." );
			}
			chmod( $path, 0600 );
			$this->output( 'Preserved ' . count( $rows ) . " active sessions.\n" );
			return;
		}

		$encodedRows = json_decode( file_get_contents( $path ), true, 512, JSON_THROW_ON_ERROR );
		$rows = array_map(
			static fn ( array $row ): array => [
				'keyname' => $row['keyname'],
				'value' => base64_decode( $row['value'], true ),
				'exptime' => $row['exptime'],
			],
			$encodedRows
		);
		if ( $rows ) {
			$db->newReplaceQueryBuilder()
				->replaceInto( 'objectcache' )
				->rows( $rows )
				->uniqueIndexFields( [ 'keyname' ] )
				->caller( __METHOD__ )
				->execute();
		}
		$this->output( 'Restored ' . count( $rows ) . " active sessions.\n" );
	}
}

$maintClass = PreserveSessions::class;
require_once RUN_MAINTENANCE_IF_MAIN;
