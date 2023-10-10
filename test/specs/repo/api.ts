import assert from 'assert';
import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from '../../helpers/WDIOWikibaseApiPatch.js';

describe( 'Wikibase API', function () {
	it( 'Should be able to create many properties and items', async () => {
		const numEntities = 100;
		for ( let i = 0; i < numEntities; i++ ) {
			const itemLabel = 'T267743-';
			const propertyValue = 'PropertyExampleStringValue';
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

			const itemId = await WikibaseApi.createItem(
				getTestString( itemLabel ),
				data
			);

			assert.strictEqual( itemId.startsWith( 'Q' ), true );
			assert.strictEqual( propertyId.startsWith( 'P' ), true );
		}
	} );
} );
