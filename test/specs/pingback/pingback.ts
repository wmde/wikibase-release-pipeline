import page from '../../helpers/pages/page.js';

describe( 'Pingback', function () {
	it( 'Should ping on first page request', async function () {
		await page.open( '/wiki/Main_Page' );

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 15 * 1000 );

		const sqlResult = await browser.dbQuery(
			'SELECT * from updatelog where ul_key LIKE "WikibasePingback%"'
		);
		expect( sqlResult ).toMatch( 'WikibasePingback\t' );
		expect( sqlResult ).toMatch( 'WikibasePingback-1.' );

		const result = await browser.makeRequest( 'http://pingback-beacon' );
		expect( result.data ).toHaveLength( 2 );

		const requestData = JSON.parse(
			Object.keys( result.data[ 0 ] )[ 0 ].replace( ';', '' )
		);

		expect( requestData.schema ).toEqual( 'WikibasePingback' );
	} );
} );
