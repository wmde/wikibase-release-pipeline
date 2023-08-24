'use strict';

const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const assert = require( 'assert' );
const { getElementByURI } = require( '../../helpers/blazegraph' );

describe( 'Wikibase post upgrade', function () {

	const itemLabel = 'NewUpgradeItem';
	const propertyValue = 'NewUpgradeItemStringValue';
	let newItemId;
	let newPropertyId;

	before( function () {
		if ( process.env.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able to create a new specific item', function () {

		newPropertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: newPropertyId,
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		newItemId = browser.call(
			() => WikibaseApi.createItem( itemLabel, data )
		);

		assert.strictEqual( newItemId.startsWith( 'Q' ), true );
		assert.strictEqual( newPropertyId.startsWith( 'P' ), true );

	} );

	it( 'New item should show up in Queryservice', async function () {

		let bindings;

		await browser.waitUntil(
			async () => {

				bindings = browser.queryBlazeGraphItem( newItemId );

				return bindings.length === 9;
			},
			{
				timeout: 15000,
				timeoutMsg: 'Blazegraph should have updated the item by now'
			}
		);

		assert.strictEqual( bindings.length, 9 );

		const statement = getElementByURI( process.env.MW_SERVER + '/prop/' + newPropertyId, bindings );
		const property = getElementByURI( process.env.MW_SERVER + '/prop/direct/' + newPropertyId, bindings );

		const itemLabelValue = getElementByURI( 'http://www.w3.org/2000/01/rdf-schema#label', bindings );
		const dateModified = getElementByURI( 'http://schema.org/dateModified', bindings );
		const schemaVersion = getElementByURI( 'http://schema.org/version', bindings );
		const siteLinks = getElementByURI( 'http://wikiba.se/ontology#sitelinks', bindings );
		const identifiers = getElementByURI( 'http://wikiba.se/ontology#identifiers', bindings );
		const timestamp = getElementByURI( 'http://wikiba.se/ontology#timestamp', bindings );

		assert( dateModified !== null );
		assert( schemaVersion !== null );
		assert( siteLinks !== null );
		assert( identifiers !== null );
		assert( timestamp !== null );
		assert( statement !== null );

		assert.strictEqual( property.o.value, propertyValue );
		assert.strictEqual( itemLabelValue.o.value, itemLabel );

	} );

} );
