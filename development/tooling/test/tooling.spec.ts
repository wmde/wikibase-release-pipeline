import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe( 'WBS installation image selection', () => {
	it( 'selects the compatible major version published by the tools project', () => {
		const toolsPackage = JSON.parse(
			readFileSync( resolve( 'images/wbs-tools/package.json' ), 'utf8' )
		) as { version: string };
		const major = toolsPackage.version.split( '.', 1 )[ 0 ];
		const versionsScript = resolve( '../tools/scripts/_versions.sh' );
		const selectedImage = execFileSync(
			'bash',
			[
				'-c',
				'source "$1"; printf "%s" "$WBS_TOOLS_IMAGE"',
				'bash',
				versionsScript
			],
			{
				encoding: 'utf8',
				env: { ...process.env, WBS_TOOLS_IMAGE: '' }
			}
		);

		assert.equal( selectedImage, `wikibase/wbs-tools:${ major }` );
	} );

	it( 'selects every locally built product image without pulling it', () => {
		const repositoryRoot = resolve( '..' );
		const output = execFileSync(
			'docker',
			[
				'compose',
				'--env-file',
				resolve( repositoryRoot, '.env.example' ),
				'-f',
				resolve( repositoryRoot, 'docker-compose.yml' ),
				'-f',
				resolve( repositoryRoot, 'tools/docker-compose.build.yml' ),
				'config'
			],
			{ encoding: 'utf8' }
		);

		for ( const image of [
			'wikibase/wikibase:latest',
			'wikibase/opensearch:latest',
			'wikibase/wdqs:latest',
			'wikibase/wdqs-frontend:latest',
			'wikibase/quickstatements:latest'
		] ) {
			assert.ok( output.includes( `image: ${ image }` ), `Missing ${ image }` );
		}
		assert.match( output, /pull_policy: never/u );
	} );
} );
