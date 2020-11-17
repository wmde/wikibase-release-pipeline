'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const EntityPage = require( 'wdio-wikibase/pageobjects/entity.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );
const sync = require("@wdio/sync").default;

describe( 'item', async function () {
	
	it( 'can add a statement using the keyboard', async function () {

		browser.url('https://webdriver.io')
		const foo = await browser.$("#search_input_react");
		foo.waitForExist();
		// // high-level overview: add statement, add qualifier, add second qualifier, add reference, save
		
		// // TODO make an item using the UI
		// const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T154869-' ) ) );
		
		// // base url -> browser.config.baseUrl

		// //const propertyId = browser.call( () => WikibaseApi.getProperty( 'string' ) );
		// EntityPage.open( itemId );
		// console.log("asdf")
		// // wait for page to load
		// ItemPage.addStatementLink.waitForDisplayed();

		// //browser.url()

	} );
} );
