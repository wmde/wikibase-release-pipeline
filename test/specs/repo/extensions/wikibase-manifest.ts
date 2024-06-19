describe( 'WikibaseManifest', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'WikibaseManifest' );
	} );

	it( 'Should have rest endpoint and data', async function () {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/rest.php/wikibase-manifest/v0/manifest'
		);
		const data = result.data;

		expect( data.name ).toEqual( 'wikibase' );

		expect( data.api.action ).toEqual( testEnv.vars.WIKIBASE_URL + '/w/api.php' );
		expect( data.api.rest ).toEqual( testEnv.vars.WIKIBASE_URL + '/w/rest.php' );

		expect( data.oauth.registration_page ).toEqual(
			testEnv.vars.WIKIBASE_URL + '/wiki/Special:OAuthConsumerRegistration'
		);
	} );
} );
