import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	ADMIN_USERNAME,
	INSTALL_TIMEOUT,
	WIKIBASE_URL,
	verifyCliArtifact,
	verifyCommandInterface,
	waitForInstalledServicesHealthy
} from '../../suites/wbs-tools/test-environment.js';

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
	it( 'contains the compiled command-line installer', () => {
		verifyCliArtifact();
	} );
	it( 'provides the supported wbs install command interface', () => {
		verifyCommandInterface();
	} );

	it( 'boots a healthy Wikibase Suite whose administrator can log in', async () => {
		await browser.url( '/' );
		await clickEnabledButton( 'Get started' );

		await setField( 'WIKIBASE_PUBLIC_HOST', 'wikibase.test' );
		await setField( 'WDQS_PUBLIC_HOST', 'query.wikibase.test' );
		await clickEnabledButton( 'Continue' );

		await setField( 'MW_ADMIN_EMAIL', ADMIN_EMAIL );
		await setField( 'MW_ADMIN_NAME', ADMIN_USERNAME );
		await setField( 'MW_ADMIN_PASS', ADMIN_PASSWORD );
		await clickEnabledButton( 'Continue' );

		await setField( 'DB_PASS', 'WbsToolsDatabasePassword-2026' );
		await setField( 'DB_NAME', 'wbs_tools_test' );
		await setField( 'DB_USER', 'wbs_tools_user' );
		await clickEnabledButton( 'Start installation' );

		const completionHeading = await $( 'h2=Installation complete! 🎉' );
		await completionHeading.waitForDisplayed( { timeout: INSTALL_TIMEOUT } );
		await waitForInstalledServicesHealthy();

		await browser.url( `${ WIKIBASE_URL }/wiki/Special:UserLogin` );
		await setField( 'wpName', ADMIN_USERNAME );
		await setField( 'wpPassword', ADMIN_PASSWORD );
		await clickEnabledButton( 'Log in' );
		await expect( $( '#pt-userpage-2' ) ).toBeDisplayed();
	} );
} );
