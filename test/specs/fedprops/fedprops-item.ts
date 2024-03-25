import { AxiosError } from 'axios';
import { getTestString } from 'wdio-mediawiki/Util.js';
import SpecialEntityPage from 'wdio-wikibase/pageobjects/item.page.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import QueryServiceUIPage from '../../helpers/pages/queryservice-ui/queryservice-ui.page.js';
import SpecialEntityDataPage from '../../helpers/pages/special/entity-data.page.js';

describe( 'Fed props Item', function () {
	const propertyId = 'P213';
	const propertyValue = 'ISNI';
	const itemId = 'Q1';
	const itemLabel = 'T267743-';

	it( 'Should search wikidata.org through wbsearchentities with no local properties', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbsearchentities&search=ISNI&format=json&language=en&type=property`
		);

		expect( result.data.success ).toEqual( 1 );
		expect( result.data.search.length ).toBeGreaterThan( 0 );
	} );

	it( 'can add a federated property and it shows up in the ui', async function () {
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

		await ItemPage.open( itemId );

		await expect( $( '.wikibase-statementgroupview-property' ) ).toHaveText(
			new RegExp( propertyValue )
		); // value is the label

		await SpecialEntityPage.addStatementLink;
	} );

	it( 'should NOT show up in Special:EntityData with ttl', async function () {
		try {
			await SpecialEntityDataPage.getData( 'Q1', 'ttl' );
		} catch ( error ) {
			expect( error ).toBeInstanceOf( AxiosError );
			expect( error.request.res.statusCode ).toEqual( 500 );
		}
	} );

	it( 'should show up in Special:EntityData with json', async function () {
		const data = await SpecialEntityDataPage.getData( 'Q1' );
		expect(
			data.entities.Q1.claims[ 'http://www.wikidata.org/entity/P213' ]
		).toEqual( expect.anything() );
	} );

	it( 'should NOT show up in Special:EntityData with rdf', async function () {
		try {
			await SpecialEntityDataPage.getData( 'Q1', 'rdf' );
		} catch ( error ) {
			expect( error ).toBeInstanceOf( AxiosError );
			expect( error.request.res.statusCode ).toEqual( 500 );
		}
	} );

	it( 'should NOT show property in queryservice ui after creation using prefixes', async function () {
		const prefixes = [ 'prefix fpwdt: <http://www.wikidata.org/prop/direct/>' ];
		const query = `SELECT * WHERE{ ?s fpwdt:${ propertyId } ?o }`;

		await QueryServiceUIPage.open( query, prefixes );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 11 * 1000 );

		await QueryServiceUIPage.submit();
		await QueryServiceUIPage.resultTable;

		// Item should never have made its way into the query service, as TTL doesnt work
		await expect(
			QueryServiceUIPage.resultIncludes(
				`<${ testEnv.vars.WIKIBASE_URL }/entity/${ itemId }>`,
				propertyValue
			)
		).resolves.toEqual( false );
	} );

	it( 'should NOT show up in queryservice ui after creation', async function () {
		// query the item using wd: prefix
		await QueryServiceUIPage.open( `SELECT * WHERE{ wd:${ itemId } ?p ?o }` );

		await QueryServiceUIPage.submit();
		await QueryServiceUIPage.resultTable;

		// Item should never have made its way into the query service, as TTL doesnt work
		await expect(
			QueryServiceUIPage.resultIncludes( 'schema:version' )
		).resolves.toEqual( false );
		await expect(
			QueryServiceUIPage.resultIncludes( 'schema:dateModified' )
		).resolves.toEqual( false );
		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:timestamp' )
		).resolves.toEqual( false );

		await expect(
			QueryServiceUIPage.resultIncludes( 'rdfs:label', itemLabel )
		).resolves.toEqual( false );

		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:statements', '1' )
		).resolves.toEqual( false );

		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:sitelinks', '0' )
		).resolves.toEqual( false );
		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:identifiers', '1' )
		).resolves.toEqual( false );

		await expect( QueryServiceUIPage.resultIncludes( 'p:P213' ) ).resolves.toEqual(
			false
		);
	} );
} );
