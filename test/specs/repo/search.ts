import WikibaseApi from 'wdio-wikibase/wikibase.api.js';

describe( 'Search', function () {
	it( 'Should be able to create an item and search for it', async function () {
		const itemLabel = 'something';
		await WikibaseApi.createItem( itemLabel, {} );

		await browser.waitForJobs();

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 2000 );

		const result = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbsearchentities&search=${ itemLabel }&format=json&errorformat=plaintext&language=en&uselang=en&type=item`
		);

		expect( result.data.search[ 0 ].label ).toBe( itemLabel );
	} );
} );
