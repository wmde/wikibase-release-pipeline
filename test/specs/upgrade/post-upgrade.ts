import assert from 'assert';

describe( 'Wikibase post upgrade', function () {
	let oldItemID: string;

	it( 'Should be able find the item after upgrade', async () => {
		const result = await browser.makeRequest(
			process.env.MW_SERVER +
        '/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item'
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert.strictEqual( searchResults.length, 1 );
		assert.strictEqual( searchResults[ 0 ].match.text, 'UpgradeItem' );
		assert.strictEqual( searchResults[ 0 ].match.type, 'label' );

		oldItemID = searchResults[ 0 ].id;

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + oldItemID );
	} );

	it( 'should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Special:EntityData/' + oldItemID + '.json'
		);
		const body = response.data;

		assert( body.entities[ oldItemID ].claims[ 0 ] !== null );
	} );
} );
