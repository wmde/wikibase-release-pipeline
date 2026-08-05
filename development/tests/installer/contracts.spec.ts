import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	INSTALLER_TEMP_ROOT,
	toolsImage,
	verifyCliInstallWaitsForConfiguration
} from './test-environment.js';

describe( 'Installer supporting contracts', () => {
	it( 'selects stable releases and forwards supported bootstrap options', () => {
		execFileSync(
			'bash',
			[ fileURLToPath( new URL( './install-bootstrap.sh', import.meta.url ) ) ],
			{ encoding: 'utf8' }
		);
	} );

	it( 'provides the supported wbs install command interface', () => {
		const image = toolsImage();
		const help = execFileSync(
			'docker',
			[ 'run', '--rm', image, 'node', 'dist/wbs.js', 'install', '--help' ],
			{ encoding: 'utf8' }
		);
		for ( const option of [ '--web', '--local', '--from-source', '--debug' ] ) {
			assert.ok(
				help.includes( option ),
				`wbs install help does not include ${ option }.`
			);
		}

		const invalid = spawnSync(
			'docker',
			[
				'run', '--rm', '-e', 'WBS_VALIDATE_OPTIONS=true', image,
				'node', 'dist/wbs.js', 'install', '--unknown-option'
			],
			{ encoding: 'utf8', stdio: 'pipe' }
		);
		assert.notEqual( invalid.status, 0 );
	} );

	it( 'does not reapply template values over an existing configuration', () => {
		const configRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'configuration-' ) );
		try {
			// Paths are contained by the test-owned temporary directory.
			writeFileSync( join( configRoot, '.env.example' ), 'TEMPLATE_ONLY=template\n' );
			writeFileSync( join( configRoot, '.env' ), 'EXISTING_ONLY=preserved\n' );
			const input = {
				MW_ADMIN_EMAIL: 'admin@example.test',
				WIKIBASE_PUBLIC_HOST: 'wikibase.test',
				WDQS_PUBLIC_HOST: 'query.wikibase.test',
				METADATA_CALLBACK: 'false',
				MW_ADMIN_NAME: 'Admin',
				MW_ADMIN_PASS: 'AdminPassword-2026',
				DB_NAME: 'my_wiki',
				DB_USER: 'sqluser',
				DB_PASS: 'DatabasePassword-2026'
			};
			const script = [
				"import('./dist/lib/configuration.js')",
				`.then(({ getConfig }) => console.log(JSON.stringify(getConfig(${ JSON.stringify( input ) }).config)))`
			].join( '' );
			const output = execFileSync(
				'docker',
				[
					'run', '--rm',
					'-v', `${ configRoot }:/app/wbs`,
					toolsImage(), 'node', '--input-type=module', '--eval', script
				],
				{ encoding: 'utf8' }
			);
			const config = JSON.parse( output ) as Record<string, string>;
			assert.equal( config.EXISTING_ONLY, 'preserved' );
			assert.equal( config.TEMPLATE_ONLY, undefined );
		} finally {
			rmSync( configRoot, { recursive: true, force: true } );
		}
	} );

	it( 'loads local.env after .env for lifecycle Compose commands', () => {
		const composeRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'compose-' ) );
		try {
			writeFileSync( join( composeRoot, '.env' ), 'IMAGE_TAG=published\n' );
			writeFileSync( join( composeRoot, 'local.env' ), 'IMAGE_TAG=local\n' );
			writeFileSync( join( composeRoot, 'docker-compose.yml' ), 'services: {}\n' );
			const fakeDocker = join( composeRoot, 'docker' );
			writeFileSync(
				fakeDocker,
				'#!/bin/sh\nprintf "%s\\n" "$@" > /app/wbs/docker-arguments\n'
			);
			chmodSync( fakeDocker, 0o755 );
			execFileSync(
				'docker',
				[
					'run', '--rm',
					'-v', `${ composeRoot }:/app/wbs`,
					'-v', `${ fakeDocker }:/usr/local/bin/docker:ro`,
					toolsImage(), 'node', '--input-type=module', '--eval',
					"import('./dist/lib/compose.js').then(({ status }) => status())"
				],
				{ encoding: 'utf8' }
			);
			assert.match(
				readFileSync( join( composeRoot, 'docker-arguments' ), 'utf8' ),
				/--env-file\n\/app\/wbs\/\.env\n--env-file\n\/app\/wbs\/local\.env\n/u
			);
		} finally {
			rmSync( composeRoot, { recursive: true, force: true } );
		}
	} );

	it( 'finishes CLI configuration before starting lifecycle operations', () => {
		verifyCliInstallWaitsForConfiguration();
	} );
} );
