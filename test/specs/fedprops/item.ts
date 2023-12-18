import assert from 'assert';
import { AxiosError } from 'axios';
import { getTestString } from 'wdio-mediawiki/Util.js';
import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import QueryServiceUI from '../../helpers/pages/queryservice-ui/queryservice-ui.page.js';
import { CreateItemRequestData } from '../../types/create-item-request-data.js';
import { EntityData } from '../../types/entity-data.js';

type TestProperty = { id: string; value: string };

type WBSearchEntitiesResult = {
	search: { id: string }[];
	success: number;
};

describe( 'Fed Props Item', function () {
	const testProperty: TestProperty = { id: 'P213', value: 'ISNI' };
	let itemId: string;
	const itemLabel = 'T267743-';

	before( 'can add a federated property', async () => {
		const data: CreateItemRequestData = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: `http://www.wikidata.org/entity/${testProperty.id}`,
						datavalue: { value: testProperty.value, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};
		itemId = await WikibaseApi.createItem( getTestString( itemLabel ), data );
	} );

	it( 'should search wikidata.org through wbsearchentities with no local properties', async () => {
		const result = await browser.makeRequest(
			`${process.env.MW_SERVER}/w/api.php?action=wbsearchentities&search=${testProperty.value}&format=json&language=en&type=property`
		);
		const resultData: WBSearchEntitiesResult = result.data;
		assert.strictEqual( resultData.success, 1 );
		assert( resultData.search.length > 0 );
	} );

	it( 'Should show an added federated property in the ui', async () => {
		await browser.url( `${process.env.MW_SERVER}/wiki/Item:${itemId}` );

		const actualPropertyValue = await $(
			'.wikibase-statementgroupview-property'
		).getText();
		assert( actualPropertyValue.includes( testProperty.value ) ); // value is the label

		await ItemPage.addStatementLink;
	} );

	it( 'should NOT show up in Special:EntityData with ttl', async () => {
		try {
			await browser.makeRequest(
				`${process.env.MW_SERVER}/wiki/Special:EntityData/${itemId}.ttl`
			);
		} catch ( error ) {
			assert( error instanceof AxiosError );
			assert.equal( error.request.res.statusCode, 500 );
		}
	} );

	it( 'should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			`${process.env.MW_SERVER}/wiki/Special:EntityData/${itemId}.json`
		);
		const body: EntityData = response.data;

		assert.notEqual(
			body.entities.Q1.claims[ 'http://www.wikidata.org/entity/P213' ],
			null
		);
	} );

	it( 'should NOT show up in Special:EntityData with rdf', async () => {
		try {
			await browser.makeRequest(
				`${process.env.MW_SERVER}/wiki/Special:EntityData/${itemId}.rdf`
			);
		} catch ( error ) {
			assert( error instanceof AxiosError );
			assert.equal( error.request.res.statusCode, 500 );
		}
	} );

	it( 'should NOT show property in queryservice ui after creation using prefixes', async () => {
		const prefixes = [ 'prefix fpwdt: <http://www.wikidata.org/prop/direct/>' ];
		const query = `SELECT * WHERE{ ?s fpwdt:${testProperty.id} ?o }`;

		await QueryServiceUI.open( query, prefixes );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 11 * 1000 );

		await QueryServiceUI.submit();
		await QueryServiceUI.resultTable;

		// Item should never have made its way into the query service, as TTL doesnt work
		assert(
			!( await QueryServiceUI.resultIncludes(
				`<${process.env.MW_SERVER}/entity/${itemId}>`,
				testProperty.value
			) )
		);
	} );

	it( 'should NOT show up in queryservice ui after creation', async () => {
		// query the item using wd: prefix
		await QueryServiceUI.open( `SELECT * WHERE{ wd:${itemId} ?p ?o }` );

		await QueryServiceUI.submit();
		await QueryServiceUI.resultTable;

		// Item should never have made its way into the query service, as TTL doesnt work
		assert( !( await QueryServiceUI.resultIncludes( 'schema:version' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'schema:dateModified' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:timestamp' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'rdfs:label', itemLabel ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:statements', '1' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:sitelinks', '0' ) ) );
		assert( !( await QueryServiceUI.resultIncludes( 'wikibase:identifiers', '1' ) ) );

		assert( !( await QueryServiceUI.resultIncludes( `p:${testProperty.id}` ) ) );
	} );
} );
