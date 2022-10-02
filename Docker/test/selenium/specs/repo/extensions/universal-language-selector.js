'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'UniversalLanguageSelector', function () {

	it( 'Should be able to see the language selector menu', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );

		browser.url( process.env.MW_SERVER );
		$( '#searchInput' ).waitForDisplayed();
		$( '#searchInput' ).click();
		$( '.imeselector' ).waitForDisplayed();
		$( '.imeselector' ).click();

		const firstLang = $( '.imeselector-menu h3' ).getText();

		assert.strictEqual( firstLang, 'English' );

	} );

} );
