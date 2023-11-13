import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'Nuke', function () {
	beforeEach( async function () {
		await browser.waitForJobs();
		await skipIfExtensionNotPresent( this, 'Nuke' );
	} );

	it( 'Should be able to delete a page through Special:Nuke', async function () {
		await browser.editPage(
			process.env.MW_SERVER,
			'Vandalism',
			'Vandals In Motion'
		);

		const pageExistsResult = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageExistsResult.status, 200 );

		await LoginPage.login( process.env.MW_ADMIN_NAME, process.env.MW_ADMIN_PASS );
		await browser.url( process.env.MW_SERVER + '/wiki/Special:Nuke' );

		await $( 'button.oo-ui-inputWidget-input' ).click();

		await $( 'form li' );

		await $( '.mw-checkbox-none' ).click();
		await $( 'input[value="Vandalism"]' ).click();
		await $( 'input[type="submit"]' ).click();

		await browser.acceptAlert();

		await $( 'li*=has been queued for deletion' );

		await browser.waitForJobs();

		const pageIsGoneResult = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageIsGoneResult.status, 404 );
	} );
} );
