'use strict';

const assert = require( 'assert' );

describe( 'Repo Item', function () {

	it( 'Special:NewItem should be visible on repo', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const createNewItem = $( 'h1#firstHeading' ).getText();
		assert( createNewItem === '(special-newitem)' );
	} );

} );
