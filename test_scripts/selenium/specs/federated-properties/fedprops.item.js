'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const QueryServiceUI = require( '../../queryservice-ui/queryservice-ui.page' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );

describe( 'Fed props Item', function () {

	it( 'can add federated property in and shows up queryservice ui after creation', function () {

		const itemLabel = 'T267743-';
		const propertyId = 'P213'; // ISNI (string) on wikidata.org
		const propertyValue = 'ISNI';

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
		const itemId = browser.call( () => WikibaseApi.createItem( Util.getTestString( itemLabel ), data ) );

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
		assert( QueryServiceUI.resultIncludes( 'wikibase:identifiers', '1' ) );

		// property value is set with correct rdf
		assert( QueryServiceUI.resultIncludes( '<' + process.env.MW_SERVER + '/prop/direct/' + propertyId + '>', propertyValue ) );

	} );

} );
