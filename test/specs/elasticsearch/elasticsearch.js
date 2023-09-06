'use strict';

const assert = require( 'assert' );
const Util = require( 'wdio-mediawiki/Util' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

const itemAlias = Util.getTestString( 'alias' );
const itemLabel = Util.getTestString( 'testItem' );

describe( 'ElasticSearch', function () {

	let itemId;

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
		assert.strictEqual( alias, itemAlias );
	} );

	it( 'should be able to search case-insensitive', async function () {

		let searchResult;

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=Test&format=json&errorformat=plaintext&language=en&uselang=en&type=item' );
				searchResult = resp.data.search;

				return searchResult.length === 1 &&
					searchResult[ 0 ].id === itemId &&
					searchResult[ 0 ].match.type === 'label' &&
					searchResult[ 0 ].match.text === itemLabel;
			},
			{
				timeout: 20000,
				timeoutMsg: 'Elasticsearch should have updated the label by now.'
			}
		);
		assert( searchResult.length === 1 &&
			searchResult[ 0 ].id === itemId &&
			searchResult[ 0 ].match.type === 'label' &&
			searchResult[ 0 ].match.text === itemLabel
		);
	} );

	it( 'should be able to search via alias', async function () {

		let searchResult;

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=alias&format=json&errorformat=plaintext&language=en&uselang=en&type=item' );
				searchResult = resp.data.search;

				return searchResult.length === 1 &&
					searchResult[ 0 ].id === itemId &&
					searchResult[ 0 ].match.type === 'alias' &&
					searchResult[ 0 ].match.text === itemAlias;
			},
			{
				timeout: 20000,
				timeoutMsg: 'Elasticsearch should have updated the alias by now.'
			}
		);

		assert(
			searchResult.length === 1 &&
			searchResult[ 0 ].id === itemId &&
			searchResult[ 0 ].match.type === 'alias' &&
			searchResult[ 0 ].match.text === itemAlias
		);

	} );
} );
