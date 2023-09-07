'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

describe( 'Property Prefetching', function () {

	let itemId;
	const itemLabel = 'T267743-';
	const NUM_PROPERTIES = 25;

	it( 'can add many federated properties and it shows up in the ui', async () => {

		await browser.url( 'https://www.wikidata.org/wiki/Special:ListProperties?datatype=string' );
		const specialLiEl = await $( 'ol.special li a' );
		await specialLiEl.waitForDisplayed();

		const links = ( await $$( 'ol.special li a' ) ).slice( 0, NUM_PROPERTIES );

		const claims = await Promise.all( links.map( async ( link ) => {
			const linkHref = await link.getAttribute( 'href' );
			const prop = 'http://www.wikidata.org/entity/' + linkHref.replace( '/wiki/Property:', '' );
			return {
				mainsnak: {
					snaktype: 'value',
					property: prop,
					datavalue: { value: 'test-value', type: 'string' }
				},
				type: 'statement',
				rank: 'normal'
			};
		} ) );
		assert.strictEqual( claims.length, NUM_PROPERTIES );

		const data = { claims: claims };
		itemId = await WikibaseApi.createItem( Util.getTestString( itemLabel ), data );

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		const toolbarButtonEl = await $( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' );
		await toolbarButtonEl.waitForDisplayed();
	} );

	it( 'should delete all statements and generate individual changes', async () => {

		const statements = await $$( '.wikibase-statementview' );
		const propertyGuids = await Promise.all( statements.map( async ( statement ) => statement.getAttribute( 'id' ) ) );

		assert.strictEqual( propertyGuids.length, NUM_PROPERTIES );

		for ( const guid of propertyGuids ) {
			const response = await browser.deleteClaim( guid );
			assert.strictEqual( response.success, 1 );
		}

		// Sleep for 2 seconds to ensure post edit things run
		await browser.pause( 2000 );
	} );

	it( 'Should render history page list within threshold', async () => {
		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId + '?action=history' );
		const historyEl = await $( '#pagehistory' );
		await historyEl.waitForDisplayed( { timeout: 2000 } );

		// +1 for the initial item creation
		assert.strictEqual( ( await $$( '#pagehistory li' ) ).length, NUM_PROPERTIES + 1 );

	} );

	it( 'Should render recent changes list within threshold', async () => {
		await browser.url( process.env.MW_SERVER + '/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0' );
		const specialEl = await $( 'ul.special' );
		await specialEl.waitForDisplayed( { timeout: 2000 } );

		// +1 for the initial item creation
		// +1 for the Main Page creation?
		// +1 for ?
		assert.strictEqual( ( await $$( 'ul.special li' ) ).length, NUM_PROPERTIES + 3 );
	} );

} );
