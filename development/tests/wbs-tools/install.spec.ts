import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	ADMIN_USERNAME,
	DATABASE_NAME,
	DATABASE_PASSWORD,
	DATABASE_USER,
	INSTALL_TIMEOUT,
	WIKIBASE_URL,
	toolsImage,
	verifyCliInstallWaitsForConfiguration,
	verifyFinalizedInstallerArtifacts,
	verifyInstallerContainerIsolation,
	verifySubmittedInstallerConfiguration,
	waitForInstalledServicesHealthy,
	waitForInstallerStopped
} from './test-environment.js';

async function setField( name: string, value: string ): Promise<void> {
	const field = await $( `input[name="${ name }"]` );
	await field.waitForDisplayed();
	await field.setValue( value );
	await browser.keys( 'Tab' );
}

async function clickEnabledButton( label: string ): Promise<void> {
	const button = await $( `button=${ label }` );
	await button.waitForClickable();
	await button.click();
}

describe( 'WBS tools installer', () => {
	it( 'selects stable releases and forwards supported bootstrap options', () => {
		execFileSync(
			'bash',
			[ fileURLToPath( new URL( './install-bootstrap.sh', import.meta.url ) ) ],
			{ encoding: 'utf8' }
		);
	} );
	it( 'contains the compiled command-line installer', () => {
		execFileSync(
			'docker',
			[
				'run',
				'--rm',
				'--entrypoint',
				'sh',
				toolsImage(),
				'-c',
				'test -f dist/wbs.js && test -f dist/cli/configure.js'
			],
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
		for ( const option of [
			'--web',
			'--local',
			'--from-source',
			'--debug'
		] ) {
			assert.ok(
				help.includes( option ),
				`wbs install help does not include ${ option }.`
			);
		}
		assert.doesNotMatch( help, /--cli/u );

		for ( const invalidOption of [
			'--cli',
			'--installer-dev',
			'--unknown-option'
		] ) {
			const result = spawnSync(
				'docker',
				[
					'run',
					'--rm',
					'-e',
					'WBS_VALIDATE_OPTIONS=true',
					image,
					'node',
					'dist/wbs.js',
					'install',
					invalidOption
				],
				{ encoding: 'utf8', stdio: 'pipe' }
			);
			assert.notEqual(
				result.status,
				0,
				`wbs install unexpectedly accepted ${ invalidOption }.`
			);
		}
	} );

	it( 'provides configuration and lifecycle command interfaces', () => {
		const image = toolsImage();
		const help = execFileSync(
			'docker',
			[ 'run', '--rm', image, 'node', 'dist/wbs.js', '--help' ],
			{ encoding: 'utf8' }
		);
		for ( const command of [ 'configure', 'up', 'down', 'status', 'reset' ] ) {
			assert.ok( help.includes( command ), `wbs help does not include ${ command }.` );
		}

		const configureHelp = execFileSync(
			'docker',
			[ 'run', '--rm', image, 'node', 'dist/wbs.js', 'configure', '--help' ],
			{ encoding: 'utf8' }
		);
		assert.match( configureHelp, /--web/u );
		assert.match( configureHelp, /--local/u );
		assert.doesNotMatch( configureHelp, /--from-source/u );

		const upHelp = execFileSync(
			'docker',
			[ 'run', '--rm', image, 'node', 'dist/wbs.js', 'up', '--help' ],
			{ encoding: 'utf8' }
		);
		assert.match( upHelp, /--update/u );
		assert.match( upHelp, /--local-images/u );
		assert.match( upHelp, /--build/u );
	} );

	it( 'does not reapply template values over an existing configuration', () => {
		const configRoot = mkdtempSync( join( tmpdir(), 'wbs-config-' ) );
		try {
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
				"import('./dist/shared/configuration.js')",
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

	it( 'finishes CLI configuration before starting lifecycle operations', () => {
		verifyCliInstallWaitsForConfiguration();
	} );

	it( 'boots a healthy Wikibase Suite, finalizes securely, and preserves administrator login', async () => {
		await browser.url( '/' );
		await clickEnabledButton( 'Get started' );

		await setField( 'WIKIBASE_PUBLIC_HOST', 'wikibase.test' );
		await setField( 'WDQS_PUBLIC_HOST', 'query.wikibase.test' );
		await clickEnabledButton( 'Continue' );

		await setField( 'MW_ADMIN_EMAIL', ADMIN_EMAIL );
		await setField( 'MW_ADMIN_NAME', ADMIN_USERNAME );
		await setField( 'MW_ADMIN_PASS', ADMIN_PASSWORD );
		await clickEnabledButton( 'Continue' );

		await setField( 'DB_NAME', DATABASE_NAME );
		await setField( 'DB_USER', DATABASE_USER );
		await setField( 'DB_PASS', DATABASE_PASSWORD );
		await clickEnabledButton( 'Continue' );

		await expect( $( 'h2=Visibility' ) ).toBeDisplayed();
		const visibilityCheckbox = await $( 'input[name="METADATA_CALLBACK"]' );
		await expect( visibilityCheckbox ).not.toBeSelected();
		await visibilityCheckbox.click();
		await expect( visibilityCheckbox ).toBeSelected();
		await clickEnabledButton( 'Start installation' );
		verifyInstallerContainerIsolation();

		const completionHeading = await $( 'h2=Installation complete! 🎉' );
		await completionHeading.waitForDisplayed( { timeout: INSTALL_TIMEOUT } );
		await waitForInstalledServicesHealthy();
		verifySubmittedInstallerConfiguration();
		await clickEnabledButton( 'View log' );
		const stopInstallerButton = await $(
			'.setup-log-dialog .shutdown-panel button'
		);
		await stopInstallerButton.waitForDisplayed();
		await stopInstallerButton.waitForEnabled();
		await stopInstallerButton.scrollIntoView( { block: 'center' } );
		await stopInstallerButton.waitForClickable();
		await stopInstallerButton.click();
		await waitForInstallerStopped();
		verifyFinalizedInstallerArtifacts();

		await browser.url( `${ WIKIBASE_URL }/wiki/Special:UserLogin` );
		await setField( 'wpName', ADMIN_USERNAME );
		await setField( 'wpPassword', ADMIN_PASSWORD );
		await clickEnabledButton( 'Log in' );
		await expect( $( '#pt-userpage-2' ) ).toBeDisplayed();
	} );
} );
