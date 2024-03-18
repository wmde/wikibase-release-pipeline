import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';

describe( 'Wikibase pre upgrade', function () {
	it( 'Should be able to create many properties and items', async function () {
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

			expect( itemId.startsWith( 'Q' ) ).toEqual( true );
			expect( propertyId.startsWith( 'P' ) ).toEqual( true );
		}
	} );

	it( 'Should be able to create a specific item', async function () {
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

		expect( itemId.startsWith( 'Q' ) ).toEqual( true );
		expect( propertyId.startsWith( 'P' ) ).toEqual( true );
	} );
} );
