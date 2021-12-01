'use strict';

const { assert } = require( 'console' );
const Util = require( 'wdio-mediawiki/Util' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

const itemAlias = Util.getTestString( 'alias' );
const itemLabel = Util.getTestString( 'testItem' );

describe( 'ElasticSearch', function () {

	let itemId = null;

	it( 'Should create an item', function () {

		itemId = browser.call(
			() => WikibaseApi.createItem( itemLabel )
		);
		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
	} );

	it( 'Should be able to set alias', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Special:SetAliases/' );

		// input id
		$( '#wb-modifyentity-id input' ).waitForDisplayed();
		$( '#wb-modifyentity-id input' ).setValue( itemId );

		// input alias term and submit
		$( '#wb-modifyterm-value input' ).waitForDisplayed();
		$( '#wb-modifyterm-value input' ).setValue( itemAlias );
		$( 'button.oo-ui-inputWidget-input' ).click();

		// alias should be visible on item page
		$( '.wikibase-aliasesview-list-item' ).waitForDisplayed();
		const alias = $( '.wikibase-aliasesview-list-item' ).getText();
		assert( alias === itemAlias );
	} );

	it( 'should be able to search case-insensitive', function () {

		// Search for case-insensitive label
		browser.waitUntil(
			() => function () {
				browser.url( process.env.MW_SERVER + '/wiki/Special:Search?search=Test' );

				$( 'li.mw-search-result a' ).waitForDisplayed();
				const searchHit = $( 'li.mw-search-result a' ).getText();
				return searchHit === itemLabel + ' (' + itemId + ')';
			},
			{
				timeout: 10000,
				timeoutMsg: 'Expected to be done after 10 seconds'
			}
		);
	} );

	it( 'should be able to search via alias', function () {

		// Search for alias "alias"
		browser.waitUntil(
			() => function () {
				browser.url( process.env.MW_SERVER + '/wiki/Special:Search?search=alias' );

				$( 'li.mw-search-result a' ).waitForDisplayed();
				const searchHit = $( 'li.mw-search-result a' ).getText();
				return searchHit === itemLabel + ' (' + itemId + ')';
			},
			{
				timeout: 10000,
				timeoutMsg: 'Expected to be done after 10 seconds'
			}
		);
	} );
} );
