'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

describe( 'Property Prefetching', function () {

	let itemId;
	const itemLabel = 'T267743-';
	const properties = [];
	const propertyGuids = [];
	const NUM_PROPERTIES = 25;

	it( 'can add many federated properties and it shows up in the ui', function () {

		browser.url( 'https://www.wikidata.org/wiki/Special:ListProperties?datatype=string' );
		$( 'ol.special li a' ).waitForDisplayed();

		const links = $$( 'ol.special li a' ).slice( 0, NUM_PROPERTIES );

		const claims = [];

		links.forEach( ( link ) => {
			const prop = 'http://www.wikidata.org/entity/' + link.getAttribute( 'href' ).replace( '/wiki/Property:', '' );
			properties.push( prop );
			claims.push(
				{
					mainsnak: {
						snaktype: 'value',
						property: prop,
						datavalue: { value: 'test-value', type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			);
		} );

		const data = {
			claims: claims
		};
		itemId = browser.call(
			() => WikibaseApi.createItem( Util.getTestString( itemLabel ), data )
		);

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
	} );

	it( 'should delete all statements and generate individual changes', function () {

		const statements = $$( '.wikibase-statementview' );
		statements.forEach( ( statement ) => {
			propertyGuids.push( statement.getAttribute( 'id' ) );
		} );

		assert.strictEqual( propertyGuids.length, NUM_PROPERTIES );

		propertyGuids.forEach( ( guid ) => {
			const response = browser.deleteClaim( guid );
			assert.strictEqual( response.success, 1 );
		} );
	} );

	it( 'Should render history page list within threshold', function () {
		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId + '?action=history' );
		$( '#pagehistory' ).waitForDisplayed( { timeout: 2000 } );

		assert( $$( '#pagehistory li' ).length >= NUM_PROPERTIES );

	} );

	it( 'Should render recent changes list within threshold', function () {
		browser.url( process.env.MW_SERVER + '/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0' );
		$( 'ul.special' ).waitForDisplayed( { timeout: 2000 } );

		assert( $$( 'ul.special li' ).length >= NUM_PROPERTIES );
	} );

} );
