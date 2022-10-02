'use strict';

const assert = require( 'assert' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'Nuke', function () {

	it( 'Should be able to queue a page for deletion through Special:Nuke', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Nuke' );

		browser.editPage(
			process.env.MW_SERVER,
			'Vandalism',
			'Vandals In Motion'
		);

		const result = browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Vandalism',
			{ validateStatus: false },
			{}
		);

		assert.strictEqual( result.status, 200 );

		LoginPage.loginAdmin();

		browser.url( process.env.MW_SERVER + '/wiki/Special:Nuke' );

		$( 'button.oo-ui-inputWidget-input' ).waitForDisplayed();
		$( 'button.oo-ui-inputWidget-input' ).click();

		$( 'form li' ).waitForDisplayed();

		$( '.mw-checkbox-none' ).click();
		const checkBox = $( 'input[value="Vandalism"]' );
		checkBox.click();
		$( 'input[type="submit"]' ).click();
		browser.acceptAlert();

		$( '#mw-content-text' ).waitForDisplayed();

	} );

	it( 'Should delete the page in a job', async function () {
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
