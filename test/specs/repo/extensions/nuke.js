import assert from 'assert';
import SuiteLoginPage from '../../../helpers/pages/SuiteLoginPage';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions';

describe( 'Nuke', function () {
	beforeEach( async () => {
		await browser.waitForJobs();
	} );

	it( 'Should be able to queue a page for deletion through Special:Nuke', async () => {
		skipIfExtensionNotPresent( this, 'Nuke' );

		await browser.editPage(
			process.env.MW_SERVER,
			'Vandalism',
			'Vandals In Motion'
		);

		const result = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( result.status, 200 );

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
	} );

	it( 'Should delete the page in a job', async () => {
		let result;

		await browser.waitUntil(
			async () => {
				result = await browser.makeRequest(
					process.env.MW_SERVER + '/wiki/Vandalism',
					{ validateStatus: false },
					{}
				);

				return result.status === 404;
			},
			{
				timeout: 10000,
				timeoutMsg: 'Page should be deleted by now.'
			}
		);

		assert.strictEqual( result.status, 404 );
	} );
} );
