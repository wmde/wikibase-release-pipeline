import { getTestString } from 'wdio-mediawiki/Util.js';
import assert from 'assert';
import QueryServiceUI from '../../helpers/pages/queryservice-ui/queryservice-ui.page.js';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { stringify } from 'querystring';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import awaitDisplayed from '../../helpers/await-displayed.js';

describe( 'QueryService', () => {
	it( 'Should not be able to post to sparql endpoint', async () => {
		const result = await browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/sparql',
			{ validateStatus: false },
			{}
		);
		assert.strictEqual( result.status, 405 );
	} );

	it( 'Should be able to get sparql endpoint', async () => {
		const result = await browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/sparql'
		);
		assert.strictEqual( result.status, 200 );
	} );

	it( 'Should not be possible to reach blazegraph ldf api thats not enabled', async () => {
		const result = await browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/ldf',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should not be possible to reach blazegraph ldf assets thats not enabled', async () => {
		const result = await browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/assets',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should not be possible to reach blazegraph workbench', async () => {
		const result = await browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/#query',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should show up with property in queryservice ui after creation', async () => {
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
		await QueryServiceUI.open( `SELECT * WHERE{ wd:${itemId} ?p ?o }` );

		// wait for WDQS-updater
		await browser.pause( 20 * 1000 );

		await QueryServiceUI.submit();
		await awaitDisplayed( QueryServiceUI.resultTable );

		assert( await QueryServiceUI.resultIncludes( 'schema:version' ) );
		assert( await QueryServiceUI.resultIncludes( 'schema:dateModified' ) );
		assert( await QueryServiceUI.resultIncludes( 'wikibase:timestamp' ) );

		// label should match on the prefix
		assert( await QueryServiceUI.resultIncludes( 'rdfs:label', itemLabel ) );

		// should have one statement
		assert( await QueryServiceUI.resultIncludes( 'wikibase:statements', '1' ) );

		assert( await QueryServiceUI.resultIncludes( 'wikibase:sitelinks', '0' ) );
		assert( await QueryServiceUI.resultIncludes( 'wikibase:identifiers', '0' ) );

		// property value is set with correct rdf
		assert(
			await QueryServiceUI.resultIncludes(
				`<${process.env.MW_SERVER}/prop/direct/${propertyId}>`,
				propertyValue
			)
		);

		// query the property using wdt: prefix
		await QueryServiceUI.open( `SELECT * WHERE{ ?s wdt:${propertyId} ?o }` );

		await QueryServiceUI.submit();
		await awaitDisplayed( QueryServiceUI.resultTable );

		// should be set only to the item
		assert(
			await QueryServiceUI.resultIncludes(
				`<${process.env.MW_SERVER}/entity/${itemId}>`,
				propertyValue
			)
		);
	} );

	it( 'Should not show up in queryservice ui after deletion', async () => {
		// TODO make an item using the UI
		const itemId = await WikibaseApi.createItem( getTestString( 'T267743-' ) );

		await LoginPage.login( process.env.MW_ADMIN_NAME, process.env.MW_ADMIN_PASS );

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			browser.options.baseUrl + '/index.php?' + stringify( query )
		);
		const destructiveButtonEl = await awaitDisplayed(
			'.oo-ui-flaggedElement-destructive button'
		);
		await destructiveButtonEl.click();

		await QueryServiceUI.open( `SELECT * WHERE{ wd:${itemId} ?p ?o }` );

		// wait for WDQS-updater
		await browser.pause( 20 * 1000 );

		await QueryServiceUI.submit();

		const resultTable = await awaitDisplayed( QueryServiceUI.resultTable );
		const resultText = await resultTable.getText();

		// item should not be included
		assert( !resultText.includes( 'schema:version' ) );
		assert( !resultText.includes( 'schema:dateModified' ) );
		assert( !resultText.includes( 'wikibase:sitelinks' ) );
		assert( !resultText.includes( 'wikibase:identifiers' ) );
		assert( !resultText.includes( 'rdfs:label' ) );

		// timestamp always shows
		assert( resultText.includes( 'wikibase:timestamp' ) );
	} );
} );
