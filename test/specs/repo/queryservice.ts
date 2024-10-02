import { stringify } from 'querystring';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import QueryServiceUIPage from '../../helpers/pages/queryservice-ui/queryservice-ui.page.js';
import SpecialNewItemPage from '../../helpers/pages/special/new-item.page.js';
import { wikibasePropertyString } from '../../helpers/wikibase-property-types.js';

describe( 'QueryService', function () {
	it( 'Should not be able to post to sparql endpoint', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WDQS_PROXY_URL }/bigdata/namespace/wdq/sparql`,
			{ validateStatus: false },
			{}
		);
		expect( result.status ).toEqual( 405 );
	} );

	it( 'Should be able to get sparql endpoint', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WDQS_PROXY_URL }/bigdata/namespace/wdq/sparql`
		);
		expect( result.status ).toEqual( 200 );
	} );

	it( 'Should not be possible to reach blazegraph ldf api that is not enabled', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WDQS_PROXY_URL }/bigdata/namespace/wdq/ldf`,
			{ validateStatus: false }
		);
		expect( result.status ).toEqual( 404 );
	} );

	it( 'Should not be possible to reach blazegraph ldf assets thats not enabled', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WDQS_PROXY_URL }/bigdata/namespace/wdq/assets`,
			{ validateStatus: false }
		);
		expect( result.status ).toEqual( 404 );
	} );

	it( 'Should not be possible to reach blazegraph workbench', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WDQS_PROXY_URL }/bigdata/#query`,
			{ validateStatus: false }
		);
		expect( result.status ).toEqual( 404 );
	} );

	it( 'Should show up with property in queryservice ui after creation', async function () {
		const itemLabel = 'T267743-';
		const propertyValue = 'PropertyExampleStringValue';

		const propertyId = await WikibaseApi.createProperty( 'string' );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		const itemId = await WikibaseApi.createItem( getTestString( itemLabel ), data );

		// query the item using wd: prefix
		await QueryServiceUIPage.open( `SELECT * WHERE{ wd:${ itemId } ?p ?o }` );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 20 * 1000 );

		await QueryServiceUIPage.submit();
		await QueryServiceUIPage.resultTable;

		await expect(
			QueryServiceUIPage.resultIncludes( 'schema:version' )
		).resolves.toEqual( true );
		await expect(
			QueryServiceUIPage.resultIncludes( 'schema:dateModified' )
		).resolves.toEqual( true );
		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:timestamp' )
		).resolves.toEqual( true );

		// label should match on the prefix
		await expect(
			QueryServiceUIPage.resultIncludes( 'rdfs:label', itemLabel )
		).resolves.toEqual( true );

		// should have one statement
		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:statements', '1' )
		).resolves.toEqual( true );

		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:sitelinks', '0' )
		).resolves.toEqual( true );
		await expect(
			QueryServiceUIPage.resultIncludes( 'wikibase:identifiers', '0' )
		).resolves.toEqual( true );

		// property value is set with correct rdf
		await expect(
			QueryServiceUIPage.resultIncludes(
				`<${ testEnv.vars.WIKIBASE_URL }/prop/direct/${ propertyId }>`,
				propertyValue
			)
		).resolves.toEqual( true );

		// query the property using wdt: prefix
		await QueryServiceUIPage.open( `SELECT * WHERE{ ?s wdt:${ propertyId } ?o }` );

		await QueryServiceUIPage.submit();
		await QueryServiceUIPage.resultTable;

		// should be set only to the item
		await expect(
			QueryServiceUIPage.resultIncludes(
				`<${ testEnv.vars.WIKIBASE_URL }/entity/${ itemId }>`,
				propertyValue
			)
		).resolves.toEqual( true );
	} );

	it( 'Should not show up in queryservice ui after deletion', async function () {
		await SpecialNewItemPage.open();

		await $( 'input[name="label"]' ).setValue( getTestString( 'T267743-' ) );
		await $( 'input[name="description"]' ).setValue( getTestString( 'Description' ) );
		await $( 'input[name="aliases"]' ).setValue(
			`${ getTestString( 'A' ) }|${ getTestString( 'B' ) }`
		);
		await SpecialNewItemPage.submit();

		await expect( $( 'h1#firstHeading' ).$( 'span.wikibase-title-id' ) ).toHaveText(
			/\(Q\d+\)/
		);
		const itemId = (
			await $( 'h1#firstHeading' ).$( 'span.wikibase-title-id' ).getText()
		).replace( /[()]/g, '' );

		// Check it shows up after creation
		await QueryServiceUIPage.open( `SELECT * WHERE{ wd:${ itemId } ?p ?o }` );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 20 * 1000 );

		await QueryServiceUIPage.submit();
		await QueryServiceUIPage.resultTable;

		await expect(
			QueryServiceUIPage.resultIncludes( 'schema:version' )
		).resolves.toBe( true );

		// Attempt to delete
		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			`${ browser.options.baseUrl }/index.php?${ stringify( query ) }`
		);
		await $( '.oo-ui-flaggedElement-destructive button' ).click();

		await QueryServiceUIPage.open( `SELECT * WHERE{ wd:${ itemId } ?p ?o }` );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 20 * 1000 );

		await QueryServiceUIPage.submit();

		const resultText = await QueryServiceUIPage.resultTable.getText();

		// item should not be included
		expect( resultText ).not.toMatch( 'schema:version' );
		expect( resultText ).not.toMatch( 'schema:dateModified' );
		expect( resultText ).not.toMatch( 'wikibase:sitelinks' );
		expect( resultText ).not.toMatch( 'wikibase:identifiers' );
		expect( resultText ).not.toMatch( 'rdfs:label' );

		// timestamp always shows
		expect( resultText ).toMatch( 'wikibase:timestamp' );
	} );

	it( 'Should show results for a select query', async function () {
		await QueryServiceUIPage.open( 'SELECT * where { ?a ?b ?c }' );
		await QueryServiceUIPage.submit();
		expect(
			( await QueryServiceUIPage.resultTable.$( 'tbody' ).$$( 'tr' ) ).length
		).toBeGreaterThan( 0 );
	} );

	it( 'Should show list of properties', async function () {
		await QueryServiceUIPage.open( `SELECT ?property ?propertyType ?propertyLabel ?propertyDescription ?propertyAltLabel WHERE {
			?property wikibase:propertyType ?propertyType .
			SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
		  }
		  ORDER BY ASC(xsd:integer(STRAFTER(STR(?property), 'P')))` );
		await QueryServiceUIPage.submit();
		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="property"]' )
		).toExist();
		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="propertyType"]' )
		).toExist();
		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="propertyLabel"]' )
		).toExist();
		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="propertyDescription"]' )
		).toExist();
		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="propertyAltLabel"]' )
		).toExist();
		expect(
			( await QueryServiceUIPage.resultTable.$( 'tbody' ).$$( 'tr' ) ).length
		).toBeGreaterThan( 0 );
	} );

	it( 'Should show a property connected to item', async function () {
		const propertyId = await WikibaseApi.createProperty(
			wikibasePropertyString.urlName
		);
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: {
							value: 'test-property',
							type: wikibasePropertyString.urlName
						}
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		const itemId = await WikibaseApi.createItem(
			getTestString( 'test-item-label' ),
			data
		);

		await QueryServiceUIPage.open( `SELECT (COUNT(*) AS ?count)
		WHERE {
		  <${ testEnv.vars.WIKIBASE_URL }/entity/${ itemId }> <${ testEnv.vars.WIKIBASE_URL }/prop/direct/${ propertyId }> "test-property" .
		}` );

		// wait for WDQS-updater
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 20 * 1000 );

		await QueryServiceUIPage.submit();

		await expect(
			QueryServiceUIPage.resultTable.$( 'th[data-field="count"]' ).$( 'div' )
		).toHaveText( 'count' );
		await expect(
			QueryServiceUIPage.resultTable
				.$( 'tbody' )
				.$( 'tr[data-index="0"]' )
				.$( 'span' )
		).toHaveText( '1' );
	} );

	it( 'Should show results from a page in allowlist.txt', async function () {
		// We don't currently have a way for WBS Deploy to pass tests with breaking changes
		// Please see T361575 for more info
		if ( testEnv.settings.name === 'deploy' ) {
			this.skip();
		}

		await QueryServiceUIPage.open( `
			PREFIX wikidata_wd: <http://www.wikidata.org/entity/>
			PREFIX wikidata_wdt: <http://www.wikidata.org/prop/direct/>

			SELECT * WHERE {
				service <https://query.wikidata.org/sparql> {
					?wd wikidata_wdt:P31 wikidata_wd:Q976981 .
					?wd wikidata_wdt:P31 ?type .
					optional { ?wd rdfs:label ?label. filter(lang(?label) = "en") }
					optional { ?type rdfs:label ?typelabel. filter(lang(?typelabel) = "en") }
				}
			}

			LIMIT 5
		` );

		await QueryServiceUIPage.submit();

		await expect(
			QueryServiceUIPage.resultTable.$( 'tbody' ).$$( 'tr' )
		).resolves.toHaveLength( 5 );
	} );

	it( 'Should show error from a page not in allowlist.txt', async function () {
		// Returns results if https://wikibase.world/query/sparql added to allowlist.txt
		await QueryServiceUIPage.open( `
			PREFIX wdt: <https://wikibase.world/prop/direct/>
			PREFIX wd: <https://wikibase.world/entity/>

			SELECT * WHERE {
				service <https://wikibase.world/query/sparql> {
					?item wdt:P3 wd:Q10 .
					?item wdt:P1 ?url .
					?item wdt:P13 wd:Q54 .
				}
			}

			LIMIT 5
		` );

		await QueryServiceUIPage.submit();

		await expect( $( 'div#query-error' ) ).toHaveText(
			/Service URI https:\/\/wikibase\.world\/query\/sparql is not allowed/
		);
	} );
} );
