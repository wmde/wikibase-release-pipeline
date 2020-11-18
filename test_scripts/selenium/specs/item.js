'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const sync = require("@wdio/sync").default;
const QueryServiceUI = require('../queryservice-ui/queryservice-ui.page');
const LoginPage = require('wdio-mediawiki/LoginPage');
const querystring = require( 'querystring' );

describe( 'Item', function () {
	
	it( 'should shows up in queryservice ui after creation', function () {
		
		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T267743-' ) ) );
		
		QueryServiceUI.open('#' + 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }');
		// wait for WDQS-updater
		browser.pause(20*1000);

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		const resultText = QueryServiceUI.resultTable.getText();

		assert( resultText.includes('schema:version') )
		assert( resultText.includes('schema:dateModified') )

		assert( resultText.includes('rdfs:label') )

		assert( resultText.includes('wikibase:sitelinks') )
		assert( resultText.includes('wikibase:identifiers') )
		assert( resultText.includes('wikibase:timestamp') )
	} );

	it( 'should not show up in queryservice ui after deletion', function () {
		
		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T267743-' ) ) );
		
		LoginPage.loginAdmin();

		// goto delete page
		const query = { 'action': 'delete','title': 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);
		$(".oo-ui-flaggedElement-destructive button").waitForDisplayed();
		$(".oo-ui-flaggedElement-destructive button").click();

		QueryServiceUI.open('#' + 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }');

		// wait for WDQS-updater
		browser.pause(20*1000);

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		const resultText = QueryServiceUI.resultTable.getText();

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
