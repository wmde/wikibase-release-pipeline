import assert from 'assert';

describe( 'WikibaseManifest', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'WikibaseManifest' );
	} );

	it( 'Should have rest endpoint and data', async function () {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/rest.php/wikibase-manifest/v0/manifest'
		);
		const data = result.data;

		assert.strictEqual( 'wikibase-docker', data.name );

		assert.strictEqual(
			testEnv.vars.WIKIBASE_URL + '/w/api.php',
			data.api.action
		);
		assert.strictEqual(
			testEnv.vars.WIKIBASE_URL + '/w/rest.php',
			data.api.rest
		);

		assert.strictEqual(
			testEnv.vars.WIKIBASE_URL + '/wiki/Special:OAuthConsumerRegistration',
			data.oauth.registration_page
		);
	} );
} );
