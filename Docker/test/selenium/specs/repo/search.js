'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

describe( 'Search', function () {

	it( 'Should be able to create an item and search for it', function () {

		const itemLabel = 'something';
		browser.call(
			() => WikibaseApi.createItem( itemLabel, {} )
		);

		browser.pause( 10 * 1000 );

		const result = browser.makeRequest(
			process.env.MW_SERVER +
			'/w/api.php?action=wbsearchentities&search=' +
			itemLabel +
			'&format=json&errorformat=plaintext&language=en&uselang=en&type=item'
		);
		assert.strictEqual( result.data.search[ 0 ].label, itemLabel );

	} );
} );
