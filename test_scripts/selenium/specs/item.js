'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const EntityPage = require( 'wdio-wikibase/pageobjects/entity.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );
const sync = require("@wdio/sync").default;
const MainPage = require('../queryservice-ui/main.page');
const LoginPage = require('wdio-mediawiki/LoginPage');
const Page = require('wdio-mediawiki/Page');
const querystring = require( 'querystring' );

describe( 'Item', function () {
	
	it.skip( 'should shows up in queryservice ui after creation', function () {
		
		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T154869-' ) ) );
		
		MainPage.open('#' + 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }');
		// wait for WDQS-updater
		browser.pause(20*1000);

		MainPage.submit();
		MainPage.resultTable.waitForDisplayed();

		const resultText = MainPage.resultTable.getText();

		assert( resultText.includes('schema:version') )
		assert( resultText.includes('schema:dateModified') )

		assert( resultText.includes('rdfs:label') )

		assert( resultText.includes('wikibase:sitelinks') )
		assert( resultText.includes('wikibase:identifiers') )
		assert( resultText.includes('wikibase:timestamp') )
	} );

	it( 'should not shows up in queryservice ui after deletion', function () {
		
		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T154869-' ) ) );
		
		LoginPage.loginAdmin();

		// goto delete page
		const query = { 'action': 'delete','title': 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);
		$(".oo-ui-flaggedElement-destructive button").waitForDisplayed();
		$(".oo-ui-flaggedElement-destructive button").click();

		MainPage.open('#' + 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }');

		// wait for WDQS-updater
		browser.pause(20*1000);

		MainPage.submit();
		MainPage.resultTable.waitForDisplayed();

		const resultText = MainPage.resultTable.getText();

		// item should not be included
		assert( !resultText.includes('schema:version') )
		assert( !resultText.includes('schema:dateModified') )
		assert( !resultText.includes('wikibase:sitelinks') )
		assert( !resultText.includes('wikibase:identifiers') )
		assert( !resultText.includes('rdfs:label') )

		// timestamp always shows
		assert( resultText.includes('wikibase:timestamp') )

		
	} );
} );
