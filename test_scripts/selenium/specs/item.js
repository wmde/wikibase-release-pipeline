'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const EntityPage = require( 'wdio-wikibase/pageobjects/entity.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );
const sync = require("@wdio/sync").default;
const MainPage = require('../queryservice-ui/main.page')

describe( 'Item', function () {
	
	it( 'should shows up in queryservice ui after creation', function () {
		
		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T154869-' ) ) );
		
		MainPage.open('#' + 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }');
		
		// wait for WDQS-updater
		browser.pause(30*1000);

		MainPage.submit();
		MainPage.resultTable.waitForDisplayed();

		const resultText = MainPage.resultTable.getText();

		assert( resultText.includes('schema:version') )
		assert( resultText.includes('schema:dateModified') )

		assert( resultText.includes('rdfs:label') )

		assert( resultText.includes('wikibase:timestamp') )
		assert( resultText.includes('wikibase:sitelinks') )
		assert( resultText.includes('wikibase:identifiers') )
		assert( resultText.includes('wikibase:timestamp') )
	} );
} );
