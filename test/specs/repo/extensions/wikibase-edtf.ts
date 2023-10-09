import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions';
import WikibaseApi from '../../../helpers/WDIOWikibaseApiPatch.js';

describe( 'WikibaseEdtf', function () {
	let propertyId, itemId;

	it( 'Should allow to create and use the EDTF property', async () => {
		await skipIfExtensionNotPresent( this, 'Wikibase EDTF' );

		// create the property
		propertyId = await WikibaseApi.createProperty( 'edtf' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		const rawValue = '1985-04-12T23:20:30';

		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: rawValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		itemId = await WikibaseApi.createItem( 'edtf-test', data );

		// go look at wikibase
		const response = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Special:EntityData/' + itemId + '.json'
		);
		const responseSnak =
      response.data.entities[ itemId ].claims[ propertyId ][ 0 ].mainsnak;

		assert.strictEqual( responseSnak.datavalue.value, '1985-04-12T23:20:30' );
		assert.strictEqual( responseSnak.datatype, 'edtf' );

		// for a pretty screenshot
		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
	} );
} );
