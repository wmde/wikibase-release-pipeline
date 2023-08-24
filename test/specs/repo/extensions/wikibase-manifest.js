'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'WikibaseManifest', function () {

	it( 'Should have rest endpoint and data', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'WikibaseManifest' );

		const result = browser.makeRequest( process.env.MW_SERVER + '/w/rest.php/wikibase-manifest/v0/manifest' );
		const data = result.data;

		assert.strictEqual( 'wikibase-docker', data.name );

		assert.strictEqual( process.env.MW_SERVER + '/w/api.php', data.api.action );
		assert.strictEqual( process.env.MW_SERVER + '/w/rest.php', data.api.rest );

		assert.strictEqual( process.env.MW_SERVER + '/wiki/Special:OAuthConsumerRegistration', data.oauth.registration_page );

	} );

} );
