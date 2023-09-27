'use strict';

const assert = require( 'assert' );
const SuiteLoginPage = require( '../../../helpers/pages/SuiteLoginPage' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'Nuke', function () {
	beforeEach( async () => {
		await browser.waitForJobs();
	} );

	it( 'Should be able to delete a page through Special:Nuke', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Nuke' );

		await browser.editPage(
			process.env.MW_SERVER,
			'Vandalism',
			'Vandals In Motion'
		);

		let result = await browser.makeRequest(
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

		await browser.waitForJobs();

		result = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( pageIsGoneResult.status, 404 );
	} );
} );
