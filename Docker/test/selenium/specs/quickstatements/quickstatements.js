'use strict';

const assert = require( 'assert' );
const axios = require( 'axios' );

describe( 'QuickStatements Service', function () {

	before( function () {
		browser.addCommand( 'makeRequest', function async( url ) {
			return axios.get( url );
		} );
	} );

	it( 'Should be able to load the start page', function () {
		browser.url( process.env.QS_SERVER );
		$( 'nav.navbar' ).waitForDisplayed();
		const navbar = $( 'nav.navbar' ).getText();

		assert( navbar.includes( 'QuickStatements' ) );
	} );
} );
