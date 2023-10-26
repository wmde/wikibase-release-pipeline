import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import awaitDisplayed from '../../../helpers/await-displayed.js';

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

		await LoginPage.loginAdmin();
		await browser.url( process.env.MW_SERVER + '/wiki/Special:Nuke' );

		const buttonEl = await awaitDisplayed( 'button.oo-ui-inputWidget-input' );
		await buttonEl.click();

		await awaitDisplayed( 'form li' );

		const checkboxEl = await awaitDisplayed( '.mw-checkbox-none' );
		await checkboxEl.click();

		const vandalismCheckEl = await awaitDisplayed( 'input[value="Vandalism"]' );
		await vandalismCheckEl.click();

		const submitButtonEl = await awaitDisplayed( 'input[type="submit"]' );
		await submitButtonEl.click();

		await browser.acceptAlert();

		await awaitDisplayed( 'li*=has been queued for deletion' );

		await browser.waitForJobs();

		const pageIsGoneResult = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageIsGoneResult.status, 404 );
	} );
} );
