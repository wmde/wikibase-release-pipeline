describe( 'WikibaseManifest', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'WikibaseManifest' );
	} );

	it( 'Should have rest endpoint and data', async function () {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/rest.php/wikibase-manifest/v0/manifest'
		);
		const data = result.data;

		expect( 'wikibase-docker' ).toBe( data.name );

		expect( testEnv.vars.WIKIBASE_URL + '/w/api.php' ).toBe( data.api.action );
		expect( testEnv.vars.WIKIBASE_URL + '/w/rest.php' ).toBe( data.api.rest );

		expect(
			testEnv.vars.WIKIBASE_URL + '/wiki/Special:OAuthConsumerRegistration'
		).toBe( data.oauth.registration_page );
	} );
} );
