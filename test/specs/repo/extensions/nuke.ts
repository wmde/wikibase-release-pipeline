import LoginPage from 'wdio-mediawiki/LoginPage.js';
import page from '../../../helpers/pages/page.js';

describe( 'Nuke', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Nuke' );
		await browser.waitForJobs();
	} );

	it( 'Should be able to delete a page through Special:Nuke', async function () {
		await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'Vandalism',
			'Vandals In Motion'
		);

		const pageExistsResult = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		expect( pageExistsResult.status ).toEqual( 200 );

		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);
		await page.open( '/wiki/Special:Nuke' );

		await $( 'button.oo-ui-inputWidget-input' ).click();

		await $( 'form li' );

		await $( '.mw-checkbox-none' ).click();
		await $( 'input[value="Vandalism"]' ).click();
		await $( 'input[type="submit"]' ).click();

		await browser.acceptAlert();

		await expect( $( 'li*=has been queued for deletion' ) );
	} );

	it( 'Should show that a Nuke\'d page doesn\'t exist', async function () {
		this.retries( 4 );
		await page.open( '/wiki/Vandalism' );
		await expect( $( 'p*=This page does not exist' ) ).toExist();
	} );
} );
