import assert from 'assert';
import WikibaseApi from '../../helpers/WDIOWikibaseApiPatch.js';

describe( 'Wikibase pre upgrade', function () {
	it( 'Should be able to create a specific item', async () => {
		const itemLabel = 'UpgradeItem';
		const propertyValue = 'UpgradeItemStringValue';
		const propertyId = await WikibaseApi.createProperty( 'string' );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		const itemId = await WikibaseApi.createItem( itemLabel, data );

		assert.strictEqual( itemId.startsWith( 'Q' ), true );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );
	} );
} );
