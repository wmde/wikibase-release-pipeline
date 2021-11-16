'use strict';

const assert = require( 'assert' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'Nuke', function () {

	it( 'Should be able to see Special:Nuke page with a list of pages', function () {

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

		assert( result.status === 200 );

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

		browser.pause( 5 * 1000 );

		browser.waitUntil(
			() => function () {
				return browser.makeRequest(
					process.env.MW_SERVER + '/wiki/Vandalism',
					{ validateStatus: false },
					{}
				).status === 404;
			},
			{
				timeout: 10000,
				timeoutMsg: 'Expected to be done after 10 seconds'
			}
		);

	} );

} );
