import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { RepositoryContext } from '../../lib/context.js';

export function suiteConfigPath(
	context: RepositoryContext,
	suiteName: string
): string {
	return join( context.testRoot, suiteName, `${ suiteName }.conf.ts` );
}

export function discoverSuiteNames( context: RepositoryContext ): string[] {
	const suitesRoot = context.testRoot;
	if ( !existsSync( suitesRoot ) ) {
		return [];
	}
	return readdirSync( suitesRoot )
		.filter( ( entry ) => {
			const suiteRoot = join( suitesRoot, entry );
			return (
				statSync( suiteRoot ).isDirectory() &&
				existsSync( suiteConfigPath( context, entry ) )
			);
		} )
		.sort();
}
