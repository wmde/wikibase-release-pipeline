import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import envVars from '../../../setup/envVars.js';

describe( 'WikibaseEdtf', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Wikibase EDTF' );
	} );

	it( 'Should allow to create and use the EDTF property', async () => {
		// create the property
		const propertyId = await WikibaseApi.createProperty( 'edtf' );
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

		const itemId = await WikibaseApi.createItem( 'edtf-test', data );

		// go look at wikibase
		const response = await browser.makeRequest(
			`${envVars.WIKIBASE_URL}/wiki/Special:EntityData/${itemId}.json`
		);
		const responseSnak =
      response.data.entities[ itemId ].claims[ propertyId ][ 0 ].mainsnak;

		assert.strictEqual( responseSnak.datavalue.value, '1985-04-12T23:20:30' );
		assert.strictEqual( responseSnak.datatype, 'edtf' );

		// for a pretty screenshot
		await browser.url( envVars.WIKIBASE_URL + '/wiki/Item:' + itemId );
	} );
} );
