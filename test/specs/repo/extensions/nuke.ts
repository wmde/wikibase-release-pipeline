import assert from 'assert';
import SuiteLoginPage from '../../../helpers/pages/SuiteLoginPage.js';
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

		await SuiteLoginPage.loginAdmin();
		await browser.url( process.env.MW_SERVER + '/wiki/Special:Nuke' );

		const buttonEl = await $( 'button.oo-ui-inputWidget-input' );
		await buttonEl.waitForDisplayed();
		await buttonEl.click();

		const formEl = await $( 'form li' );
		await formEl.waitForDisplayed();

		const checkboxEl = await $( '.mw-checkbox-none' );
		await checkboxEl.waitForDisplayed();
		await checkboxEl.click();
		const vandalismCheckEl = await $( 'input[value="Vandalism"]' );
		await vandalismCheckEl.waitForDisplayed();
		await vandalismCheckEl.click();
		const submitButtonEl = await $( 'input[type="submit"]' );
		await submitButtonEl.waitForDisplayed();
		await submitButtonEl.click();
		await browser.acceptAlert();

		const resultPageText = $( 'li*=has been queued for deletion' );
		await resultPageText.waitForDisplayed();
		await browser.waitForJobs();

		const pageIsGoneResult = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageIsGoneResult.status, 404 );
	} );
} );
