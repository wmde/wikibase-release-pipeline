import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export interface FileUpdate {
	path: string;
	contents: string;
}

export function applyFileUpdates( updates: FileUpdate[] ): number {
	const originals = new Map(
		updates.map( ( update ) => [ update.path, readFileSync( update.path, 'utf8' ) ] )
	);
	const changed = updates.filter(
		( update ) => originals.get( update.path ) !== update.contents
	);
	const temporary: { update: FileUpdate; tempPath: string }[] = [];
	const appliedPaths: string[] = [];

	try {
		for ( const [ index, update ] of changed.entries() ) {
			const tempPath = join(
				dirname( update.path ),
				`.${ basename( update.path ) }.wbs-dev-${ process.pid }-${ index }`
			);
			writeFileSync( tempPath, update.contents );
			temporary.push( { update, tempPath } );
		}
		for ( const item of temporary ) {
			renameSync( item.tempPath, item.update.path );
			appliedPaths.push( item.update.path );
		}
	} catch ( error ) {
		for ( const path of appliedPaths ) {
			writeFileSync( path, originals.get( path )! );
		}
		throw error;
	} finally {
		for ( const item of temporary ) {
			rmSync( item.tempPath, { force: true } );
		}
	}
	return changed.length;
}
