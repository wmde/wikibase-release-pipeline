describe( 'WikibaseManifest', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'WikibaseManifest' );
	} );

	it( 'Should have rest endpoint and data', async function () {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/rest.php/wikibase-manifest/v0/manifest'
		);
		const data = result.data;

		expect( data.name ).toBe( 'wikibase-docker' );

		expect( data.api.action ).toBe( testEnv.vars.WIKIBASE_URL + '/w/api.php' );
		expect( data.api.rest ).toBe( testEnv.vars.WIKIBASE_URL + '/w/rest.php' );

		expect( data.oauth.registration_page ).toBe(
			testEnv.vars.WIKIBASE_URL + '/wiki/Special:OAuthConsumerRegistration'
		);
	} );
} );
