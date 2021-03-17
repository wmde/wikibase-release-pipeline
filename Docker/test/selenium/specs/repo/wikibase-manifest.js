'use strict';

const { assert } = require( 'console' );
const defaultFunctions = require( '../../helpers/default-functions' );

describe( 'WikibaseManifest', function () {

	before( function () {
		defaultFunctions();
	} );

	it( 'Should have rest endpoint and data', function () {

		const result = browser.makeRequest( process.env.MW_SERVER + '/w/rest.php/wikibase-manifest/v0/manifest' );
		const data = result.data;

		assert( data.name === 'wikibase-docker' );

		assert( data.api.action === process.env.MW_SERVER + '/w/api.php' );
		assert( data.api.rest === process.env.MW_SERVER + '/w/rest.php' );

		assert( data.oauth.registration_page === process.env.MW_SERVER + '/wiki/Special:OAuthConsumerRegistration' );

	} );

} );
