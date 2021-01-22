'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const axios = require( 'axios' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );
const _ = require( 'lodash' );

describe( 'Item', function () {

	let itemId = null;
	let propertyId = null;
	const propertyValue = 'PropertyExampleStringValue';

	before( function () {
		browser.addCommand( 'makeRequest', function async( url ) {
			return axios.get( url );
		} );
	} );

	it( 'Special:NewItem should not be accessible on client', function () {

		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const notFoundText = $( 'h1#firstHeading' ).getText();
		assert( notFoundText === '(nosuchspecialpage)' );
	} );

	it( 'Special:NewItem should be visible on repo', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const createNewItem = $( 'h1#firstHeading' ).getText();
		assert( createNewItem === '(special-newitem)' );
	} );

	it( 'Should create an item on repo', function () {

		const itemLabel = 'The Item';
		propertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
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

		itemId = browser.call(
			() => WikibaseApi.createItem( Util.getTestString( itemLabel ), data )
		);

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
		browser.pause( 10 * 1000 );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to create site-links from item to client', function () {

		// Create a wikitext link on a new page
		browser.url( process.env.MW_SERVER + '/wiki/Special:SetSiteLink/Q1?site=client_wiki&page=Main_Page' );
		$( '#wb-setsitelink-submit button' ).click();

		$( '.wikibase-sitelinklistview-listview li' ).waitForDisplayed();

		const siteLinkValue = $( '.wikibase-sitelinklistview-listview li' ).getText();

		// label should come from repo property
		assert( siteLinkValue.includes( 'client_wiki' ) && siteLinkValue.includes( 'Main Page' ) );
		browser.pause( 10 * 1000 );

	} );

	it( 'Should be able to use the item on client with wikitext', function () {

		// Create a wikitext link on a new page
		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Main_Page?action=edit' );
		$( '#wpTextbox1' ).setValue( '{{#statements:' + propertyId + '|from=' + itemId + '}}' );
		$( '#wpSave' ).click();
		const bodyText = $( '.mw-parser-output' ).getText();

		// label should come from repo property
		assert( bodyText === propertyValue );
		browser.pause( 10 * 1000 );

	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo and dispatching this to client', function () {

		LoginPage.loginAdmin();

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);

		$( '.oo-ui-flaggedElement-destructive button' ).waitForDisplayed();
		$( '.oo-ui-flaggedElement-destructive button' ).click();

		browser.url( process.env.MW_SERVER + '/wiki/Item:Q1' );
		browser.pause( 10 * 1000 );
	} );

	it( 'Should be able to see changes on repo item is dispatched to client', function () {

		const expectedSiteLinkChange = {
			type: 'external',
			ns: 0,
			title: 'Main Page',
			comment: 'A Wikidata item has been linked to this page.'
		};

		const expectedDeletionChange = {
			type: 'external',
			ns: 0,
			title: 'Main Page',
			comment: 'Associated Wikidata item deleted. Language links removed.'
		};

		// Wait a bit for the jobs/dispatcher to run
		browser.pause( 30 * 1000 );

		// get all external changes
		const apiURL = process.env.MW_CLIENT_SERVER + '/w/api.php?format=json&action=query&list=recentchanges&rctype=external&rcprop=comment|title';
		const result = browser.makeRequest( apiURL );
		const changes = result.data.query.recentchanges;

		console.log( changes );

		// to get a screenshot
		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2' );

		assert( !_.find( changes, expectedSiteLinkChange ) ); // this gets merged?

		assert( _.find( changes, expectedDeletionChange ) );

	} );

	it.skip( 'Should be able to reference an item on client using Lua', function () {
		// TODO
	} );

	it.skip( 'Should be able to reference an item on client using Lua and have it render on time', function () {
		// TODO
		// review the lua profiler comment in the body
	} );

} );
