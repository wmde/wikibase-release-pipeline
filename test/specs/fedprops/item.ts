import { getTestString } from 'wdio-mediawiki/Util.js';
import assert from 'assert';
import QueryServiceUI from '../../helpers/pages/queryservice-ui/queryservice-ui.page.js';
import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';
import WikibaseApi from '../../helpers/WDIOWikibaseApiPatch.js';
import { AxiosError } from 'axios';
import awaitDisplayed from '../../helpers/awaitDisplayed.js';

describe( 'Fed props Item', function () {
	const propertyId = 'P213';
	const propertyValue = 'ISNI';
	const itemId = 'Q1';
	const itemLabel = 'T267743-';

	it( 'Should search wikidata.org through wbsearchentities with no local properties', async () => {
		const result = await browser.makeRequest(
			`${process.env.MW_SERVER}/w/api.php?action=wbsearchentities&search=ISNI&format=json&language=en&type=property`
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert( searchResults.length > 0 );
	} );

	it( 'can add a federated property and it shows up in the ui', async () => {
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: 'http://www.wikidata.org/entity/P213',
						datavalue: { value: propertyValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};
		await WikibaseApi.createItem( getTestString( itemLabel ), data );

		await browser.url( `${process.env.MW_SERVER}/wiki/Item:${itemId}` );

		const actualPropertyEl = await awaitDisplayed( '.wikibase-statementgroupview-property' );
		const actualPropertyValue = await actualPropertyEl.getText();
		assert( actualPropertyValue.includes( propertyValue ) ); // value is the label

		const addStatementLink = await ItemPage.addStatementLink;
		await addStatementLink.waitForDisplayed();
	} );

	it( 'should NOT show up in Special:EntityData with ttl', async () => {
		try {
			await browser.makeRequest(
				process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.ttl'
			);
		} catch ( error ) {
			assert( error instanceof AxiosError );
			assert.equal( error.request.res.statusCode, 500 );
		}
	} );

	it( 'should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json'
		);
		const body = response.data;

		assert.notEqual(
			body.entities.Q1.claims[ 'http://www.wikidata.org/entity/P213' ],
			null
		);
	} );

	it( 'should NOT show up in Special:EntityData with rdf', async () => {
		try {
			await browser.makeRequest(
				process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.rdf'
			);
		} catch ( error ) {
			assert( error instanceof AxiosError );
			assert.equal( error.request.res.statusCode, 500 );
		}
	} );

	it( 'should NOT show property in queryservice ui after creation using prefixes', async () => {
		const prefixes = [ 'prefix fpwdt: <http://www.wikidata.org/prop/direct/>' ];
		const query = `SELECT * WHERE{ ?s fpwdt:${propertyId} ?o }`;

		await QueryServiceUI.open( query, prefixes );

		// wait for WDQS-updater
		await browser.pause( 11 * 1000 );

		await QueryServiceUI.submit();
		const resultTable = await QueryServiceUI.resultTable;
		await resultTable.waitForDisplayed();

		// Item should never have made its way into the query service, as TTL doesnt work
		assert(
			!( await QueryServiceUI.resultIncludes(
				`<${process.env.MW_SERVER}/entity/${itemId}>`,
				propertyValue
			) )
		);
	} );

	it( 'should NOT show up in queryservice ui after creation', async () => {
		// query the item using wd: prefix
		await QueryServiceUI.open( `SELECT * WHERE{ wd:${itemId} ?p ?o }` );

		await QueryServiceUI.submit();
		const resultTable = await QueryServiceUI.resultTable;
		await resultTable.waitForDisplayed();

		// Item should never have made its way into the query service, as TTL doesnt work
		assert( !( await QueryServiceUI.resultIncludes( 'schema:version' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'schema:dateModified' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:timestamp' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'rdfs:label', itemLabel ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:statements', '1' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:sitelinks', '0' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:identifiers', '1' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'p:P213' ) ) );
	} );
} );
