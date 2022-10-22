'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const QueryServiceUI = require( '../../pages/queryservice-ui/queryservice-ui.page' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );

describe( 'QueryService', function () {

	it( 'Should not be able to post to sparql endpoint', function () {
		const result = browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/sparql',
			{ validateStatus: false },
			{}
		);
		assert.strictEqual( result.status, 405 );
	} );

	it( 'Should be able to get sparql endpoint', function () {
		const result = browser.makeRequest( process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/sparql' );
		assert.strictEqual( result.status, 200 );
	} );

	it( 'Should not be possible to reach blazegraph ldf api thats not enabled', function () {
		const result = browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/ldf',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should not be possible to reach blazegraph ldf assets thats not enabled', function () {
		const result = browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/namespace/wdq/assets',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should not be possible to reach blazegraph workbench', function () {
		const result = browser.makeRequest(
			process.env.WDQS_PROXY_SERVER + '/bigdata/#query',
			{ validateStatus: false }
		);
		assert.strictEqual( result.status, 404 );
	} );

	it( 'Should show up with property in queryservice ui after creation', function () {

		const itemLabel = 'T267743-';
		const propertyValue = 'PropertyExampleStringValue';

		const propertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		const itemId = browser.call(
			() => WikibaseApi.createItem( Util.getTestString( itemLabel ), data )
		);

		// query the item using wd: prefix
		QueryServiceUI.open( 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }' );

		// wait for WDQS-updater
		browser.pause( 20 * 1000 );

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		assert( QueryServiceUI.resultIncludes( 'schema:version' ) );
		assert( QueryServiceUI.resultIncludes( 'schema:dateModified' ) );
		assert( QueryServiceUI.resultIncludes( 'wikibase:timestamp' ) );

		// label should match on the prefix
		assert( QueryServiceUI.resultIncludes( 'rdfs:label', itemLabel ) );

		// should have one statement
		assert( QueryServiceUI.resultIncludes( 'wikibase:statements', '1' ) );

		assert( QueryServiceUI.resultIncludes( 'wikibase:sitelinks', '0' ) );
		assert( QueryServiceUI.resultIncludes( 'wikibase:identifiers', '0' ) );

		// property value is set with correct rdf
		assert( QueryServiceUI.resultIncludes( '<' + process.env.MW_SERVER + '/prop/direct/' + propertyId + '>', propertyValue ) );

		// query the property using wdt: prefix
		QueryServiceUI.open( 'SELECT * WHERE{ ?s wdt:' + propertyId + ' ?o }' );

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		// should be set only to the item
		assert( QueryServiceUI.resultIncludes( '<' + process.env.MW_SERVER + '/entity/' + itemId + '>', propertyValue ) );

	} );

	it( 'Should not show up in queryservice ui after deletion', function () {

		// TODO make an item using the UI
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( 'T267743-' ) ) );

		LoginPage.loginAdmin();

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);
		$( '.oo-ui-flaggedElement-destructive button' ).waitForDisplayed();
		$( '.oo-ui-flaggedElement-destructive button' ).click();

		QueryServiceUI.open( 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }' );

		// wait for WDQS-updater
		browser.pause( 20 * 1000 );

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		const resultText = QueryServiceUI.resultTable.getText();

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
