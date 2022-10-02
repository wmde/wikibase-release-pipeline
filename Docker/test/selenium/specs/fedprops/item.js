'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const QueryServiceUI = require( '../../pages/queryservice-ui/queryservice-ui.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );

describe( 'Fed props Item', function () {

	const propertyId = 'P213';
	const propertyValue = 'ISNI';
	const itemId = 'Q1';
	const itemLabel = 'T267743-';

	it( 'Should search wikidata.org through wbsearchentities', function () {
		const result = browser.makeRequest(
			process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=ISNI&format=json&language=en&type=property'
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert( searchResults.length > 0 );
	} );

	it( 'can add a federated property and it shows up in the ui', function () {

		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: 'P213',
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};
		browser.call( () => WikibaseApi.createItem( Util.getTestString( itemLabel ), data ) );

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );

		const actualPropertyValue = $( '.wikibase-statementgroupview-property' ).getText();
		assert( actualPropertyValue.includes( propertyValue ) ); // value is the label

		ItemPage.addStatementLink.waitForDisplayed();
	} );

	it( 'should show up in Special:EntityData with ttl', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.ttl' );
		const body = response.data;

		assert( body.includes( '@prefix fpwdt: <http://www.wikidata.org/prop/direct/>' ) );
		assert( body.includes( 'fpwdt:P213 "ISNI"' ) );
	} );

	it( 'should show up in Special:EntityData with json', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		const body = response.data;

		assert( body.entities.Q1.claims[ propertyId ] !== null );
	} );

	it( 'should show up in Special:EntityData with rdf', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.rdf' );
		const body = response.data;

		assert( body.includes( 'xmlns:fpwdt="http://www.wikidata.org/prop/direct/"' ) );
		assert( body.includes( '<fpwdt:P213>ISNI</fpwdt:P213>' ) );
	} );

	it( 'shows property in queryservice ui after creation using prefixes', function () {

		const prefixes = [
			'prefix fpwdt: <http://www.wikidata.org/prop/direct/>'
		];
		const query = 'SELECT * WHERE{ ?s fpwdt:' + propertyId + ' ?o }';

		QueryServiceUI.open( query, prefixes );

		// wait for WDQS-updater
		browser.pause( 11 * 1000 );

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		// label should match on the prefix
		assert( QueryServiceUI.resultIncludes( '<' + process.env.MW_SERVER + '/entity/' + itemId + '>', propertyValue ) );

	} );

	it( 'shows up in queryservice ui after creation', function () {

		// query the item using wd: prefix
		QueryServiceUI.open( 'SELECT * WHERE{ wd:' + itemId + ' ?p ?o }' );

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
		assert( QueryServiceUI.resultIncludes( 'wikibase:identifiers', '1' ) );

		// property value is set with correct rdf
		assert( QueryServiceUI.resultIncludes( 'p:P213' ) );

	} );

} );
