'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const Util = require( 'wdio-mediawiki/Util' );

describe( 'Wikibase API', function () {

	it( 'Should be able to create many properties and items', function () {

		const numEntities = 100;
		for ( let i = 0; i < numEntities; i++ ) {

			const itemLabel = 'T267743-';
			const propertyValue = 'PropertyExampleStringValue';
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
				() => WikibaseApi.createItem( Util.getTestString( itemLabel ), data )
			);

			assert.strictEqual( itemId.startsWith( 'Q' ), true );
			assert.strictEqual( propertyId.startsWith( 'P' ), true );
		}

	} );
} );
