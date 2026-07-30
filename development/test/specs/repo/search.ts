import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';

describe( 'Search', function () {
	it( 'Should be able to create an item and search for it', async function () {
		const itemLabel = getTestString( 'search-' );
		const itemId = await WikibaseApi.createItem( itemLabel, {} );

		await browser.waitForJobs();

		let searchResult;
		await browser.waitUntil(
			async () => {
				const result = await browser.makeRequest(
					`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbsearchentities&search=${ encodeURIComponent( itemLabel ) }&format=json&errorformat=plaintext&language=en&uselang=en&type=item`
				);
				searchResult = result.data.search.find(
					( item ) => item.id === itemId
				);
				return searchResult !== undefined;
			},
			{
				timeoutMsg: `Expected ${ itemId } to appear in search results`
			}
		);

		expect( searchResult.label ).toEqual( itemLabel );
	} );
} );
