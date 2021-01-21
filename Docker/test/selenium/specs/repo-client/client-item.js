'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

describe( 'Client Item', function () {

	it( 'Special:NewItem should not be accessible on client', function () {

		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const notFoundText = $( 'h1#firstHeading' ).getText();
		assert( notFoundText === '(nosuchspecialpage)' );
	} );

	it( 'Should create an item on repo and use it on a client page with wikitext', function () {

		const itemLabel = 'The Item';
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

		// Create a wikitext link on a new page
		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Main_Page?action=edit' );
		$( '#wpTextbox1' ).setValue( '{{#statements:' + propertyId + '|from=' + itemId + '}}' );
		$( '#wpSave' ).click();
		const bodyText = $( '.mw-parser-output' ).getText();

		// label should come from repo property
		assert( bodyText === propertyValue );
	} );

	it( 'Should be able to create site-links on repo items to client wiki', function () {

		// Create a wikitext link on a new page
		browser.url( process.env.MW_SERVER + '/wiki/Special:SetSiteLink/Q1?site=client_wiki&page=Main_Page' );
		$( '#wb-setsitelink-submit button' ).click();

		$( '.wikibase-sitelinklistview-listview li' ).waitForDisplayed();

		const siteLinkValue = $( '.wikibase-sitelinklistview-listview li' ).getText();

		// label should come from repo property
		assert( siteLinkValue.includes( 'client_wiki' ) && siteLinkValue.includes( 'Main Page' ) );
	} );

	it.skip( 'Should be able to see changes on repo item is dispatched to client', function () {
		// TODO
	} );

	it.skip( 'Should be able to reference an item on client using Lua', function () {
		// TODO
	} );

	it.skip( 'Should be able to reference an item on client using Lua and have it render on time', function () {
		// TODO
		// review the lua profiler comment in the body
	} );

} );
