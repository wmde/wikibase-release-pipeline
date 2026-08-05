import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { parseBuildArguments } from './command.js';

const RUN_BUILDX = resolve( 'lib/buildx.sh' );

function dryRun( ...buildArguments: string[] ): string {
	return execFileSync(
		RUN_BUILDX,
		[
			'--cache-name',
			'wikibase',
			'--builder-name',
			'wbs-application-builder',
			'--context',
			'.',
			'--dry-run',
			'--',
			...buildArguments
		],
		{
			cwd: process.cwd(),
			encoding: 'utf8',
			env: {
				...process.env,
				BUILD_CACHE_REGISTRY: 'ghcr.io/example/wikibase',
				BUILD_CACHE_SCOPE: 'linux-amd64',
				BUILD_CACHE_PUSH: 'true'
			}
		}
	).replace( /\\/gu, '' );
}

describe( 'wbs-dev build', () => {
	it( 'adds the scoped and legacy registry caches', () => {
		const command = dryRun( '--load', '--tag', 'wikibase/wikibase:latest' );
		assert.match( command, /--builder wbs-application-builder/u );
		assert.match(
			command,
			/--cache-from type=registry,ref=ghcr\.io\/example\/wikibase\/wikibase:buildcache-linux-amd64/u
		);
		assert.match(
			command,
			/--cache-from type=registry,ref=ghcr\.io\/example\/wikibase\/wikibase:buildcache/u
		);
		assert.match(
			command,
			/--cache-to type=registry,ref=ghcr\.io\/example\/wikibase\/wikibase:buildcache-linux-amd64,mode=max,ignore-error=true/u
		);
	} );

	it( 'does not import registry caches for a no-cache build', () => {
		const command = dryRun( '--no-cache', '--pull' );
		assert.doesNotMatch( command, /--cache-from/u );
		assert.match( command, /--cache-to/u );
	} );

	it( 'keeps image selection separate from forwarded Buildx arguments', () => {
		assert.deepEqual(
			parseBuildArguments( [
				'wikibase',
				'wdqs',
				'--no-cache',
				'--parallel=2',
				'--pull'
			] ),
			{
				images: [ 'wikibase', 'wdqs' ],
				forwarded: [ '--no-cache', '--pull' ],
				parallel: 2
			}
		);
	} );

	it( 'forwards coordinator-looking options after an explicit separator', () => {
		assert.deepEqual( parseBuildArguments( [ 'wikibase', '--', '--parallel=2' ] ), {
			images: [ 'wikibase' ],
			forwarded: [ '--parallel=2' ],
			parallel: 3
		} );
	} );

	it( 'rejects invalid coordinator parallelism', () => {
		assert.throws(
			() => parseBuildArguments( [ '--parallel=0' ] ),
			/positive integer/u
		);
	} );
} );
