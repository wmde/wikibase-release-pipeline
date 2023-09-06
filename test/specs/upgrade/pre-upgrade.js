'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

describe( 'Wikibase pre upgrade', function () {

	it( 'Should be able to create a specific item', function () {

		const itemLabel = 'UpgradeItem';
		const propertyValue = 'UpgradeItemStringValue';
		const propertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		const itemId = browser.call(
			() => WikibaseApi.createItem( itemLabel, data )
		);

		assert.strictEqual( itemId.startsWith( 'Q' ), true );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

	} );
} );
