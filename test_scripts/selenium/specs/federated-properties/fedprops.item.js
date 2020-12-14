'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const QueryServiceUI = require( '../../queryservice-ui/queryservice-ui.page' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );
const request = require('request');
const path = require('path')
const fs = require('fs')
const { URL } = require('url')
const propertyId = 'P213';
const propertyValue = 'ISNI';
const itemId = 'Q1';
const itemLabel = 'T267743-';

describe( 'Fed props Item', function () {

	before(function() {
		browser.addCommand('makeRequest', function (url, cb) {
			request.get(url, cb);
		})
	  });
	

	it( 'can add a federated property and it shows up in the ui', function() {

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
		
		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId )
		$('.wikibase-statementgroupview-property' ).getText().includes(propertyValue); // value is the label
		$('.wikibase-snakview-value-container').getText().includes(propertyValue)
		$('.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add').waitForDisplayed();
	})


	it( 'should show up in Special:EntityData with ttl', function() {
		browser.url(process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.ttl');
	})

	it( 'should show up in Special:EntityData with json', function() {
		browser.url(process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json');
	})


	it.skip( 'should show up in Special:EntityData with rdf', function() {
		browser.url(process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.rdf?flavor=dump&revision=2');
	})

	it( 'shows property in ui after creation using prefixes', function () {

		const prefixes = [
			'prefix fpwdt: <http://www.wikidata.org/prop/direct/>'
		]
		const query = 'SELECT * WHERE{ ?s fpwdt:' + propertyId + ' ?o }'
		
		QueryServiceUI.open( query, prefixes );

		// wait for WDQS-updater
		browser.pause( 20 * 1000 );

		QueryServiceUI.submit();
		QueryServiceUI.resultTable.waitForDisplayed();

		// label should match on the prefix
		assert( QueryServiceUI.resultIncludes( '<' + process.env.MW_SERVER + '/entity/' + itemId + '>', propertyValue ) );

	} );

	it( 'shows up in queryservice ui after creation', function () {

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
