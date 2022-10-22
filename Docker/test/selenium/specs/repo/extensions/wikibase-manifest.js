'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'WikibaseManifest', function () {

	it( 'Should have rest endpoint and data', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'WikibaseManifest' );

		const result = browser.makeRequest( process.env.MW_SERVER + '/w/rest.php/wikibase-manifest/v0/manifest' );
		const data = result.data;

		assert.strictEqual( data.name, 'wikibase-docker' );

		assert.strictEqual( data.api.action, process.env.MW_SERVER + '/w/api.php' );
		assert.strictEqual( data.api.rest, process.env.MW_SERVER + '/w/rest.php' );

		assert.strictEqual( data.oauth.registration_page, process.env.MW_SERVER + '/wiki/Special:OAuthConsumerRegistration' );

	} );

} );
