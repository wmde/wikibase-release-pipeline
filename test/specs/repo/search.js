'use strict';

const assert = require( 'assert' );
const WikibaseApiPatch = require( '../../helpers/WikibaseApiPatch' );

describe( 'Search', function () {
	it( 'Should be able to create an item and search for it', async () => {
		const itemLabel = 'something';
		await WikibaseApiPatch.createItem( itemLabel, {} );

		await browser.waitForJobs();

		const result = await browser.makeRequest(
			process.env.MW_SERVER +
			'/w/api.php?action=wbsearchentities&search=' +
			itemLabel +
			'&format=json&errorformat=plaintext&language=en&uselang=en&type=item'
		);
		assert.strictEqual( result.data.search[ 0 ].label, itemLabel );
	} );
} );
