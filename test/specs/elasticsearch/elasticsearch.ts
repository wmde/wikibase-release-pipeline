import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import SearchResult from '../../types/search-result.js';

const itemAlias: string = getTestString( 'alias' );
const itemLabel: string = getTestString( 'testItem' );

describe( 'ElasticSearch', function () {
	let itemId: string;

	it( 'Should create an item', async () => {
		itemId = await WikibaseApi.createItem( itemLabel );

		await ItemPage.open( itemId );
		await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
	} );

	it( 'Should be able to set alias', async () => {
		await browser.url( `${testEnv.vars.WIKIBASE_URL}/wiki/Special:SetAliases/` );

		// input id
		await $( '#wb-modifyentity-id input' ).setValue( itemId );

		// input alias term and submit
		await $( '#wb-modifyterm-value input' ).setValue( itemAlias );

		await $( 'button.oo-ui-inputWidget-input' ).click();

		// alias should be visible on item page
		await expect( $( '.wikibase-aliasesview-list-item' ) ).toHaveText( itemAlias );
	} );

	it( 'should be able to search case-insensitive', async () => {
		let searchResult: SearchResult[];

		const testLabel = 'Testitem';
		expect( itemLabel.includes( testLabel ) ).toBe( false );
		expect( itemLabel.toLowerCase().includes( testLabel.toLowerCase() ) ).toBe(
			true
		);

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest(
					`${testEnv.vars.WIKIBASE_URL}/w/api.php?action=wbsearchentities&search=${testLabel}&format=json&errorformat=plaintext&language=en&uselang=en&type=item`
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
				timeout: 20 * 1000,
				timeoutMsg: 'Elasticsearch should have updated the label by now.'
			}
		);

		expect( searchResult ).toHaveLength( 1 );
		expect( searchResult[ 0 ].id ).toBe( itemId );
		expect( searchResult[ 0 ].match.type ).toBe( 'label' );
		expect( searchResult[ 0 ].match.text ).toBe( itemLabel );
	} );

	it( 'should be able to search via alias', async function () {
		let searchResult: SearchResult[];

		await browser.waitUntil(
			async () => {
				const resp = await browser.makeRequest(
					`${testEnv.vars.WIKIBASE_URL}/w/api.php?action=wbsearchentities&search=alias&format=json&errorformat=plaintext&language=en&uselang=en&type=item`
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
				timeout: 20 * 1000,
				timeoutMsg: 'Elasticsearch should have updated the alias by now.'
			}
		);

		expect( searchResult ).toHaveLength( 1 );
		expect( searchResult[ 0 ].id ).toBe( itemId );
		expect( searchResult[ 0 ].match.type ).toBe( 'alias' );
		expect( searchResult[ 0 ].match.text ).toBe( itemAlias );
	} );
} );
