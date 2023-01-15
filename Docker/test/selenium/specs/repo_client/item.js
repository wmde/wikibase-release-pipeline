'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );

const itemLabel = Util.getTestString( 'The Item' );

describe( 'Item', function () {

	let itemId = null;
	let propertyId = null;
	const propertyValue = 'PropertyExampleStringValue';
	const pageTitle = 'Test';

	it( 'Special:NewItem should not be accessible on client', function () {

		browser.url( process.env.MW_CLIENT_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const notFoundText = $( 'h1#firstHeading' ).getText();
		assert.strictEqual( notFoundText, '(nosuchspecialpage)' );
	} );

	it( 'Special:NewItem should be visible on repo', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem?uselang=qqx' );
		$( 'h1#firstHeading' ).waitForDisplayed();
		const createNewItem = $( 'h1#firstHeading' ).getText();
		assert.strictEqual( createNewItem, '(special-newitem)' );
	} );

	it( 'Should create an item on repo', function () {

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
			() => WikibaseApi.createItem( itemLabel, data )
		);

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
	} );

	// creates usage
	it( 'Should be able to use the item on client with wikitext', function () {

		browser.pause( 10 * 1000 );

		const bodyText = browser.editPage(
			process.env.MW_CLIENT_SERVER,
			pageTitle, '{{#statements:' + propertyId + '|from=' + itemId + '}}'
		);
		// label should come from repo property
		assert( bodyText.includes( propertyValue ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to create site-links from item to client', function () {

		// Create a site-link on a the Main_Page
		browser.url( process.env.MW_SERVER + '/wiki/Special:SetSiteLink/Q1?site=client_wiki&page=' + pageTitle );
		$( '#wb-setsitelink-submit button' ).waitForDisplayed();
		$( '#wb-setsitelink-submit button' ).click();

		$( '.wikibase-sitelinklistview-listview li' ).waitForDisplayed();

		const siteLinkValue = $( '.wikibase-sitelinklistview-listview li' ).getText();

		// label should come from repo property
		assert( siteLinkValue.includes( 'client_wiki' ) && siteLinkValue.includes( pageTitle ) );

		// wait for dispatching
		browser.pause( 20 * 1000 );

	} );

	it( 'Should be able to see site-link change is dispatched to client', function () {

		const expectedSiteLinkChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'A Wikibase item has been linked to this page.'
		};

		const actualChange = browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedSiteLinkChange
		);

		assert.deepStrictEqual( actualChange, expectedSiteLinkChange );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', function () {

		LoginPage.loginAdmin();

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);

		$( '.oo-ui-flaggedElement-destructive button' ).waitForDisplayed();
		$( '.oo-ui-flaggedElement-destructive button' ).click();

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for test page', function () {

		browser.pause( 30 * 1000 );

		const expectedTestDeletionChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'Associated Wikibase item deleted. Language links removed.'
		};

		const actualChange = browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedTestDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedTestDeletionChange );

	} );

} );
