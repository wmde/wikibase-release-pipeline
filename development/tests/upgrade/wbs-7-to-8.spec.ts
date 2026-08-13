import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const configurationDirectory = resolve( process.cwd(), 'upgrade/tmp/config' );

describe( 'Wikibase Suite 7 to 8 upgrade', function () {
	it( 'migrates the generated and user-owned configuration on startup', async function () {
		const instanceSettingsPath = resolve(
			configurationDirectory,
			'InstanceSettings.php'
		);
		const localSettingsPath = resolve( configurationDirectory, 'LocalSettings.php' );
		const backupPath = resolve(
			configurationDirectory,
			'backups/LocalSettings.pre-wbs-8.php.backup'
		);
		const instanceSettings = readFileSync( instanceSettingsPath, 'utf8' );
		const localSettings = readFileSync( localSettingsPath, 'utf8' );
		const backup = readFileSync( backupPath, 'utf8' );
		const fixture = readFileSync(
			resolve( process.cwd(), 'upgrade/fixtures/wbs-7/LocalSettings.php' ),
			'utf8'
		);

		expect( instanceSettings ).toContain( "$wgDBpassword = 'test-db-password';" );
		expect( instanceSettings ).toContain(
			"$wgSecretKey = '0000000000000000000000000000000000000000000000000000000000000000';"
		);
		expect( instanceSettings ).toContain(
			"$elasticsearchHost = 'elasticsearch';"
		);
		expect( instanceSettings ).not.toContain( 'custom-logo.svg' );

		expect( localSettings ).toContain( "require_once __DIR__ . '/Extensions.php';" );
		expect( localSettings ).toContain(
			"'1x' => 'https://static.example/custom-logo.svg'"
		);
		expect( localSettings ).toContain( '$wgEmergencyContact = "owner@example.test";' );
		expect( localSettings ).toContain( '$wgDefaultSkin = "monobook";' );
		expect( localSettings ).toContain( '$wgJobRunRate = 0.5;' );
		expect( localSettings ).toContain( '$wgAllowExternalImages = true;' );
		expect( localSettings ).toContain( "wfLoadExtension( 'WikibaseEdtf' );" );
		expect( localSettings ).not.toContain( '$wgEnableEmail = true;' );
		const migratedInSourceOrder = [
			"'1x' => 'https://static.example/custom-logo.svg'",
			'$wgEmergencyContact = "owner@example.test";',
			'$wgDefaultSkin = "monobook";',
			'$wgJobRunRate = 0.5;',
			'$wgAllowExternalImages = true;',
			"wfLoadExtension( 'WikibaseEdtf' );"
		].map( ( setting ) => localSettings.indexOf( setting ) );
		expect( migratedInSourceOrder.every( ( position ) => position >= 0 ) ).toBe(
			true
		);
		expect( migratedInSourceOrder ).toEqual(
			[ ...migratedInSourceOrder ].sort( ( left, right ) => left - right )
		);
		expect( backup ).toBe( fixture );
		expect( statSync( instanceSettingsPath ).mode & 0o777 ).toBe( 0o644 );
		expect( statSync( localSettingsPath ).mode & 0o777 ).toBe( 0o644 );
		expect(
			existsSync( resolve( configurationDirectory, '.wikibase-image' ) )
		).toBe( false );

		await browser.url( '/wiki/Main_Page' );
		await expect( $( 'body' ) ).toHaveElementClass( 'skin-monobook' );
		await expect( $( '#firstHeading' ) ).toHaveText( 'Main Page' );
	} );
} );
