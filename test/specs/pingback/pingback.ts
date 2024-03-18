describe( 'Pingback', function () {
	it( 'Should ping on first page request', async function () {
		await browser.url( testEnv.vars.WIKIBASE_URL + '/wiki/Main_Page' );

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 5 * 1000 );

		const sqlResult = await browser.dbQuery(
			'SELECT * from updatelog where ul_key LIKE "WikibasePingback%"'
		);
		expect( sqlResult.includes( 'WikibasePingback\t' ) ).toEqual( true );
		expect( sqlResult.includes( 'WikibasePingback-1.' ) ).toEqual( true );

		const result = await browser.makeRequest( 'http://mediawiki.svc' );
		expect( result.data ).toHaveLength( 2 );

		const requestData = JSON.parse(
			Object.keys( result.data[ 0 ] )[ 0 ].replace( ';', '' )
		);

		expect( requestData.schema ).toEqual( 'WikibasePingback' );
	} );
} );
