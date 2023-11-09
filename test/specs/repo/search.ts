import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';

describe( 'Search', function () {
	it( 'Should be able to create an item and search for it', async () => {
		const itemLabel = 'something';
		await WikibaseApi.createItem( itemLabel, {} );

		await browser.waitForJobs();

		await browser.pause( 2000 );

		const result = await browser.makeRequest(
			`${process.env.MW_SERVER}/w/api.php?action=wbsearchentities&search=${itemLabel}&format=json&errorformat=plaintext&language=en&uselang=en&type=item`
		);

		// http/:localhost:8080/w/api.php?action=wbsearchentities&search=something&format=json&errorformat=plaintext&language=en&uselang=en&type=item
		assert.strictEqual( result.data.search[ 0 ].label, itemLabel );
	} );
} );
