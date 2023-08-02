'use strict';

const fs = require( 'fs' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'SyntaxHighlight', function () {

	it( 'Should highlight lua script', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );
		defaultFunctions.skipIfExtensionNotPresent( this, 'SyntaxHighlight' );

		browser.editPage(
			process.env.WIKIBASE_PUBLIC_URL,
			'Module:Olives',
			fs.readFileSync( 'data/bananas.lua', 'utf8' )
		);

		browser.url( process.env.WIKIBASE_PUBLIC_URL + '/wiki/Module:Olives' );

		// should come with highlighted lua script
		$( '.mw-highlight' ).waitForDisplayed();
	} );

} );
