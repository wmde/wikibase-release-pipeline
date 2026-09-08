import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	INSTALLER_TEMP_ROOT,
	toolsImage,
	verifyCliInstallWaitsForConfiguration
} from './test-environment.js';
import { runtimeImageNames } from '../../images/wbs-tools/lib/compose-image-overrides.js';

describe( 'WBS Tools installer lifecycle contracts', () => {
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
				'run', '--rm', image,
				'node', 'dist/wbs.js', 'install', '--unknown-option'
			],
			{ encoding: 'utf8', stdio: 'pipe' }
		);
		assert.notEqual( invalid.status, 0 );
	} );

	it( 'describes generated and retained passwords independently', () => {
		const configRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'password-prompts-' ) );
		try {
			writeFileSync(
				join( configRoot, '.env' ),
				[
					'MW_ADMIN_EMAIL=admin@example.test',
					'WIKIBASE_PUBLIC_HOST=wikibase.test',
					'WDQS_PUBLIC_HOST=query.wikibase.test',
					'METADATA_CALLBACK=false',
					'MW_ADMIN_NAME=Admin',
					'MW_ADMIN_PASS=',
					'DB_NAME=my_wiki',
					'DB_USER=sqluser',
					'DB_PASS=ExistingDatabasePassword-2026',
					''
				].join( '\n' )
			);
			const result = spawnSync(
				'docker',
				[
					'run', '--rm', '-i',
					'-v', `${ configRoot }:/app/wbs`,
					toolsImage(), 'node', 'dist/wbs.js', 'install', 'configure', '--local'
				],
				{ encoding: 'utf8', input: '\n'.repeat( 9 ), stdio: 'pipe' }
			);
			assert.equal( result.status, 0, result.stderr );
			assert.match(
				result.stdout,
				/Admin password \(press Enter to use generated password\)/u
			);
			assert.match(
				result.stdout,
				/Database password \(press Enter to keep existing password\)/u
			);
			const config = readFileSync( join( configRoot, '.env' ), 'utf8' );
			assert.match( config, /^MW_ADMIN_PASS=.+$/mu );
			assert.match( config, /^DB_PASS=ExistingDatabasePassword-2026$/mu );
		} finally {
			rmSync( configRoot, { recursive: true, force: true } );
		}
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

	it( 'persists a validated installation manifest and Compose override', () => {
		const manifestRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'manifest-' ) );
		try {
			const commit = 'a1b2c3d4e5f678901234567890abcdef12345678';
			const tag = 'pr-942-a1b2c3d4e5f6';
			writeFileSync( join( manifestRoot, 'docker-compose.yml' ), [
				'services:',
				'  wikibase:', '    image: wikibase/wikibase:8',
				'  wikibase-jobrunner:', '    image: wikibase/wikibase:8',
				'  elasticsearch:', '    image: wikibase/opensearch:1',
				'  query:', '    image: wikibase/wdqs:2',
				'  query-updater:', '    image: wikibase/wdqs:2',
				'  wdqs-frontend:', '    image: wikibase/wdqs-frontend:2',
				'  quickstatements:', '    image: wikibase/quickstatements:1',
				''
			].join( '\n' ) );
			const imageNames = [
				...runtimeImageNames( manifestRoot ), 'wbs-tools', 'unused-build-target'
			];
			const manifest = {
				schemaVersion: 1,
				channel: 'pr',
				pr: 942,
				source: { repository: 'wmde/wikibase-suite', commit },
				images: Object.fromEntries( imageNames.map( ( name ) => [
					name, `ghcr.io/wmde/wikibase/${ name }:${ tag }`
				] ) )
			};
			const script = [
				`globalThis.fetch = async () => ({ ok: true, json: async () => (${ JSON.stringify( manifest ) }) });`,
				"import('./dist/lib/installation-manifest.js').then(({ applyInstallationManifest }) => ",
				"applyInstallationManifest({ repositoryRoot: '/app/wbs', ",
				"manifestUrl: 'https://example.test/manifest.json', ",
				`resolvedSha: '${ commit }' }))`
			].join( '' );
			execFileSync(
				'docker',
				[
					'run', '--rm',
					'-e', 'WBS_DIR=/app/wbs',
					'-v', `${ manifestRoot }:/app/wbs`,
					toolsImage(), 'node', '--input-type=module', '--eval', script
				],
				{ encoding: 'utf8' }
			);
			assert.match(
				readFileSync( join( manifestRoot, 'docker-compose.override.yml' ), 'utf8' ),
				/wikibase-jobrunner:\n[ ]{4}image: "ghcr\.io\/wmde\/wikibase\/wikibase:pr-942-a1b2c3d4e5f6"/u
			);
			assert.match(
				readFileSync( join( manifestRoot, 'docker-compose.override.yml' ), 'utf8' ),
				/query-updater:\n[ ]{4}image: "ghcr\.io\/wmde\/wikibase\/wdqs:pr-942-a1b2c3d4e5f6"/u
			);
			assert.doesNotMatch(
				readFileSync( join( manifestRoot, 'docker-compose.override.yml' ), 'utf8' ),
				/unused-build-target/u
			);
			assert.match(
				readFileSync( join( manifestRoot, '.wbs/install.env' ), 'utf8' ),
				/WBS_INSTALL_SOURCE_COMMIT='a1b2c3d4e5f678901234567890abcdef12345678'[\s\S]*WBS_TOOLS_IMAGE='ghcr\.io\/wmde\/wikibase\/wbs-tools:pr-942-a1b2c3d4e5f6'/u
			);
		} finally {
			rmSync( manifestRoot, { recursive: true, force: true } );
		}
	} );

	it( 'selects all images for a non-interactive source build', () => {
		const composeRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'source-build-' ) );
		try {
			writeFileSync(
				join( composeRoot, '.env' ),
				[
					'WIKIBASE_PUBLIC_HOST=wikibase.test',
					'WDQS_PUBLIC_HOST=query.wikibase.test',
					'MW_ADMIN_NAME=Admin',
					'MW_ADMIN_EMAIL=admin@example.test',
					'MW_ADMIN_PASS=AdminPassword-2026',
					'DB_PASS=DatabasePassword-2026',
					'DB_NAME=my_wiki',
					'DB_USER=sqluser',
					''
				].join( '\n' )
			);
			writeFileSync( join( composeRoot, 'docker-compose.yml' ), [
				'services:',
				'  wikibase:',
				'    image: wikibase/wikibase:8',
				''
			].join( '\n' ) );
			const developmentRoot = join( composeRoot, 'development' );
			writeFileSync( join( composeRoot, 'docker-arguments' ), '' );
			const fakeDocker = join( composeRoot, 'docker' );
			writeFileSync(
				fakeDocker,
				'#!/bin/sh\nprintf "%s\\n" "$@" >> /app/wbs/docker-arguments\nprintf "%s\\n" --- >> /app/wbs/docker-arguments\n'
			);
			chmodSync( fakeDocker, 0o755 );
			mkdirSync( developmentRoot );
			writeFileSync( join( developmentRoot, 'docker-compose.yml' ), 'services: {}\n' );

			execFileSync(
				'docker',
				[
					'run', '--rm',
					'-e', 'WBS_DIR=/app/wbs',
					'-e', 'ENV_FILE_PATH=/app/wbs/.env',
					'-v', `${ composeRoot }:/app/wbs`,
					'-v', `${ fakeDocker }:/usr/local/bin/docker:ro`,
					toolsImage(), 'node', '--input-type=module', '--eval',
					"import('./dist/lib/compose.js').then(({ up }) => up({ build: true }))"
				],
				{ encoding: 'utf8' }
			);
			assert.match(
				readFileSync( join( composeRoot, 'docker-arguments' ), 'utf8' ),
				/pnpm exec tsx wbs-dev\.ts build all/u
			);
			assert.match(
				readFileSync( join( composeRoot, '.wbs/local-images.override.yml' ), 'utf8' ),
				/wikibase:\n[ ]{4}image: "wikibase\/wikibase:latest"\n[ ]{4}pull_policy: never/u
			);
		} finally {
			rmSync( composeRoot, { recursive: true, force: true } );
		}
	} );

	it( 'reports installation worker failures to the browser event log', () => {
		const failureRoot = mkdtempSync( join( INSTALLER_TEMP_ROOT, 'worker-failure-' ) );
		try {
			writeFileSync(
				join( failureRoot, '.env' ),
				[
					'WIKIBASE_PUBLIC_HOST=wikibase.test',
					'WDQS_PUBLIC_HOST=query.wikibase.test',
					'MW_ADMIN_NAME=Admin',
					'MW_ADMIN_EMAIL=admin@example.test',
					'MW_ADMIN_PASS=AdminPassword-2026',
					'DB_PASS=DatabasePassword-2026',
					'DB_NAME=my_wiki',
					'DB_USER=sqluser',
					''
				].join( '\n' )
			);
			writeFileSync( join( failureRoot, 'docker-compose.yml' ), 'services: {}\n' );
			writeFileSync( join( failureRoot, 'install-request' ), 'ready\n' );
			const fakeDocker = join( failureRoot, 'docker' );
			writeFileSync(
				fakeDocker,
				'#!/bin/sh\necho "simulated image pull failure" >&2\nexit 42\n'
			);
			chmodSync( fakeDocker, 0o755 );

			const result = spawnSync(
				'docker',
				[
					'run', '--rm',
					'-e', 'WBS_DIR=/app/wbs',
					'-e', 'ENV_FILE_PATH=/app/wbs/.env',
					'-e', 'WBS_LOG_PATH=/app/wbs/wbs.log',
					'-e', 'INSTALLATION_LOG_PATH=/app/wbs/installation.log',
					'-e', 'LAUNCH_TRIGGER_PATH=/app/wbs/install-request',
					'-v', `${ failureRoot }:/app/wbs`,
					'-v', `${ fakeDocker }:/usr/local/bin/docker:ro`,
					toolsImage(),
					'node', '/app/dist/wbs.js', 'install', 'worker'
				],
				{ encoding: 'utf8', stdio: 'pipe' }
			);
			assert.notEqual( result.status, 0 );
			assert.match(
				readFileSync( join( failureRoot, 'wbs.log' ), 'utf8' ),
				/simulated image pull failure/u
			);
			assert.match(
				readFileSync( join( failureRoot, 'installation.log' ), 'utf8' ),
				/Installation failed: docker exited with status 42\. \[installation_failed\]/u
			);
		} finally {
			rmSync( failureRoot, { recursive: true, force: true } );
		}
	} );

	it( 'finishes CLI configuration before starting lifecycle operations', () => {
		verifyCliInstallWaitsForConfiguration();
	} );
} );
