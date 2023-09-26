import assert from 'assert';
import Util from 'wdio-mediawiki/Util';
import WikibaseApi from '../../helpers/WDIOWikibaseApiPatch.js';

const itemAlias = Util.getTestString( 'alias' );
const itemLabel = Util.getTestString( 'testItem' );

describe( 'ElasticSearch', function () {
	let itemId;

	it( 'Should create an item', async () => {
		itemId = await WikibaseApi.createItem( itemLabel );

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		const addButtonEl = await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
		await addButtonEl.waitForDisplayed();
	} );

	it( 'Should be able to set alias', async () => {
		await browser.url( process.env.MW_SERVER + '/wiki/Special:SetAliases/' );

		// input id
		const inputIdEl = await $( '#wb-modifyentity-id input' );
		await inputIdEl.waitForDisplayed();
		await inputIdEl.setValue( itemId );

		// input alias term and submit
		const inputValueEl = await $( '#wb-modifyterm-value input' );
		await inputValueEl.waitForDisplayed();
		await inputValueEl.setValue( itemAlias );

		const inputWidgetEl = await $( 'button.oo-ui-inputWidget-input' );
		await inputWidgetEl.click();

		// alias should be visible on item page
		const aliasesViewEl = await $( '.wikibase-aliasesview-list-item' );
		await aliasesViewEl.waitForDisplayed();
		const alias = await aliasesViewEl.getText();
		assert.strictEqual( alias, itemAlias );
	} );

	it( 'should be able to search case-insensitive', async () => {
		let searchResult;

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest(
					process.env.MW_SERVER +
					'/w/api.php?action=wbsearchentities&search=Test&format=json&errorformat=plaintext&language=en&uselang=en&type=item'
				);
				searchResult = resp.data.search;

				return (
					searchResult.length === 1 &&
					searchResult[ 0 ].id === itemId &&
					searchResult[ 0 ].match.type === 'label' &&
					searchResult[ 0 ].match.text === itemLabel
				);
			},
			{
				timeout: 20000,
				timeoutMsg: 'Elasticsearch should have updated the label by now.'
			}
		);
		assert(
			searchResult.length === 1 &&
			searchResult[ 0 ].id === itemId &&
			searchResult[ 0 ].match.type === 'label' &&
			searchResult[ 0 ].match.text === itemLabel
		);
	} );

	it( 'should be able to search via alias', async function () {
		let searchResult;

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest(
					process.env.MW_SERVER +
					'/w/api.php?action=wbsearchentities&search=alias&format=json&errorformat=plaintext&language=en&uselang=en&type=item'
				);
				searchResult = resp.data.search;

				return (
					searchResult.length === 1 &&
					searchResult[ 0 ].id === itemId &&
					searchResult[ 0 ].match.type === 'alias' &&
					searchResult[ 0 ].match.text === itemAlias
				);
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
