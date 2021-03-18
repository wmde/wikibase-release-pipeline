'use strict';

const assert = require( 'assert' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const defaultFunctions = require( '../../helpers/default-functions' );

describe( 'Nuke', function () {

	before( function () {
		defaultFunctions();
	} );

	it( 'Should be able to see Special:Nuke page with a list of pages', function () {

		browser.editPage(
			process.env.MW_SERVER,
			'Vandalism',
			'Vandals In Motion'
		);

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
		const resultText = $( '#mw-content-text' ).getText();

		assert( resultText.includes( 'Page Vandalism has been deleted.' ) === true );
	} );

} );
