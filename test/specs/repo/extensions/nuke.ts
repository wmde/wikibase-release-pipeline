import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';

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

		assert.strictEqual( pageExistsResult.status, 200 );

		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);
		await browser.url( testEnv.vars.WIKIBASE_URL + '/wiki/Special:Nuke' );

		await $( 'button.oo-ui-inputWidget-input' ).click();

		await $( 'form li' );

		await $( '.mw-checkbox-none' ).click();
		await $( 'input[value="Vandalism"]' ).click();
		await $( 'input[type="submit"]' ).click();

		await browser.acceptAlert();

		await $( 'li*=has been queued for deletion' );

		await browser.waitForJobs();

		const pageIsGoneResult = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageIsGoneResult.status, 404 );
	} );
} );
