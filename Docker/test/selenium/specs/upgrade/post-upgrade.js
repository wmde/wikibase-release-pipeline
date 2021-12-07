'use strict';

const assert = require( 'assert' );

describe( 'Wikibase post upgrade', function () {

	let itemID;

	it( 'Should be able find the item after upgrade', function () {

		const result = browser.makeRequest(
			process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=Q101&format=json&language=en&type=item'
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert( success === 1 );
		assert( searchResults.length === 1 );
		assert( searchResults[ 0 ].match.text === 'Q101' );
		assert( searchResults[ 0 ].match.type === 'entityId' );

		itemID = searchResults[ 0 ].id;

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemID );

	} );

	it( 'should show up in Special:EntityData with json', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/' + itemID + '.json' );
		const body = response.data;

		assert( body.entities[ itemID ].claims[ 0 ] !== null );
	} );

} );
