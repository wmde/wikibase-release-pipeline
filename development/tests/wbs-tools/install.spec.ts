import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	ADMIN_USERNAME,
	INSTALL_TIMEOUT,
	WIKIBASE_URL,
	toolsImage,
	verifyFinalizedInstallerArtifacts,
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
				'test -f dist/wbs.js && test -f dist/cli.js'
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

		await setField( 'DB_NAME', 'wbs_tools_test' );
		await setField( 'DB_USER', 'wbs_tools_user' );
		await setField( 'DB_PASS', 'WbsToolsDatabasePassword-2026' );
		await clickEnabledButton( 'Continue' );

		await expect( $( 'h2=Visibility' ) ).toBeDisplayed();
		const visibilityCheckbox = await $( 'input[name="METADATA_CALLBACK"]' );
		await expect( visibilityCheckbox ).not.toBeSelected();
		await visibilityCheckbox.click();
		await expect( visibilityCheckbox ).toBeSelected();
		await clickEnabledButton( 'Start installation' );

		const completionHeading = await $( 'h2=Installation complete! 🎉' );
		await completionHeading.waitForDisplayed( { timeout: INSTALL_TIMEOUT } );
		await waitForInstalledServicesHealthy();
		await clickEnabledButton( 'View log' );
		await clickEnabledButton( 'Stop the installer' );
		await waitForInstallerStopped();
		verifyFinalizedInstallerArtifacts();

		await browser.url( `${ WIKIBASE_URL }/wiki/Special:UserLogin` );
		await setField( 'wpName', ADMIN_USERNAME );
		await setField( 'wpPassword', ADMIN_PASSWORD );
		await clickEnabledButton( 'Log in' );
		await expect( $( '#pt-userpage-2' ) ).toBeDisplayed();
	} );
} );
