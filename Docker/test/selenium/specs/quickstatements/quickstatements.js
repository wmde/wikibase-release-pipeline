'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const _ = require( 'lodash' );

const getReferenceValue = function ( response, propertyId, refPropertyId ) {
	const references = response.data.claims[ propertyId ][ 0 ].references;
	return references[ 0 ].snaks[ refPropertyId ][ 0 ].datavalue.value;
};

const getQualifierType = function ( response, propertyId, qualPropertyId ) {
	for ( const statements of response.data.claims[ propertyId ] ) {
		if ( 'qualifiers' in statements ) {
			if ( qualPropertyId in statements.qualifiers ) {
				return statements.qualifiers[ qualPropertyId ][ 0 ].datatype;
			}
		}
	}
};

describe( 'QuickStatements Service', function () {

	let propertyId = null;
	let propertyIdItem = null;
	let propertyURL = null;

	it( 'Should be able to load the start page', function () {
		browser.url( process.env.QS_SERVER );
		$( 'nav.navbar' ).waitForDisplayed();
	} );

	it( 'Should be able to log in', function () {

		browser.url( process.env.QS_SERVER + '/api.php?action=oauth_redirect' );

		// login after redirect
		$( '#wpPassword1' ).waitForDisplayed();

		$( '#wpName1' ).setValue( process.env.MW_ADMIN_NAME );
		$( '#wpPassword1' ).setValue( process.env.MW_ADMIN_PASS );
		$( '#wpLoginAttempt' ).click();

		// oauth dialog
		$( '#mw-mwoauth-authorize-dialog' ).waitForDisplayed();
		$( '#mw-mwoauth-accept' ).click();

		// redirect back to app
		$( 'nav.navbar' ).waitForDisplayed();
		const navbar = $( 'nav.navbar' ).getText();
		assert( navbar.includes( 'QuickStatements' ) );
	} );

	it( 'Should be able to create two items', function () {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		browser.executeQuickStatement( 'CREATE\nCREATE' );

		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );

		assert.strictEqual( responseQ1.data.entities.Q1.id, 'Q1' );
		assert.strictEqual( responseQ2.data.entities.Q2.id, 'Q2' );
	} );

	it( 'Should be able to add an alias to an item', function () {

		browser.executeQuickStatement( 'Q1|ASv|"Kommer det funka?"' );

		// go look at wikibase
		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );

		assert( _.isEmpty( responseQ1.data.entities.Q1.aliases ) !== true );
	} );

	it( 'Should be able to add a label to an item', function () {

		browser.executeQuickStatement( 'Q1|LSv|"Some label"' );

		// go look at wikibase
		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );

		assert( _.isEmpty( responseQ1.data.entities.Q1.labels ) !== true );
	} );

	it( 'Should be able to add a description to an item', function () {

		browser.executeQuickStatement( 'Q1|DSv|"Kommer det funka?"' );

		// go look at wikibase
		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );

		assert( _.isEmpty( responseQ1.data.entities.Q1.descriptions ) !== true );
	} );

	it.skip( 'Should be able to add a sitelink to an item', function () {

		browser.executeQuickStatement( 'Q1|Sclient_wiki|"Main_Page"' );

		// go look at wikibase
		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );

		assert( _.isEmpty( responseQ1.data.entities.Q1.sitelinks ) !== true );
	} );

	it( 'Should be able to add a statement to an item', function () {

		propertyId = browser.call( () => WikibaseApi.getProperty( 'string' ) );

		browser.executeQuickStatement( 'Q1|' + propertyId + '|"Will it blend?"' );

		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		assert.strictEqual( responseQ1.data.entities.Q1.claims[ propertyId ][ 0 ].type, 'statement' );

	} );

	describe( 'Should be able to add qualifiers to statements with a range of datatypes', function () {

		const mainSnakDataTypes = [ 'string', 'wikibase-item', 'url', 'quantity', 'time' ];
		const qualifierSnakDataTypes = [ 'string', 'wikibase-item', 'url', 'quantity', 'time' ];
		const exampleSnakValues = {
			string: '"cat"',
			'wikibase-item': 'Q1',
			url: '"https://example.com"',
			quantity: '5',
			time: '+1967-01-17T00:00:00Z/11'
		};
		// should be disabled for dynamic tests
		// eslint-disable-next-line mocha/no-setup-in-describe
		mainSnakDataTypes.forEach( ( mainSnakDataType ) => {
			qualifierSnakDataTypes.forEach( ( qualifierSnakDataType ) => {
				it(
					'Should be able to add a ' + mainSnakDataType + ' statement with a ' + qualifierSnakDataType + ' qualifier.',
					() => {
						const itemId = browser.call( () => WikibaseApi.createItem( 'qualifier-item', {} ) );

						const mainPropertyId = browser.call(
							() => WikibaseApi.getProperty( mainSnakDataType )
						);
						const qualifierPropertyId = browser.call(
							() => WikibaseApi.getProperty( qualifierSnakDataType )
						);
						browser.executeQuickStatement(
							itemId + '|' + mainPropertyId + '|' + exampleSnakValues[ mainSnakDataType ] + '|' +
						qualifierPropertyId + '|' + exampleSnakValues[ qualifierSnakDataType ]
						);

						const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbgetclaims&format=json&entity=' + itemId );
						assert.strictEqual(
							getQualifierType(
								responseQ1,
								mainPropertyId,
								qualifierPropertyId
							),
							qualifierSnakDataType
						);
					}
				);
			} );
		} );
	} );

	it( 'Should be able to add statement with qualifiers', function () {

		propertyIdItem = browser.call( () => WikibaseApi.getProperty( 'wikibase-item' ) );

		browser.executeQuickStatement( 'Q1|' + propertyIdItem + '|Q1|' + propertyIdItem + '|Q1' );

		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		assert.strictEqual( responseQ1.data.entities.Q1.claims[ propertyId ][ 0 ].type, 'statement' );

	} );

	it( 'Should be able to add a property with "wikibase-item" reference', function () {

		const itemId = browser.call( () => WikibaseApi.createItem( 'reference-item', {} ) );

		propertyIdItem = browser.call( () => WikibaseApi.getProperty( 'wikibase-item' ) );
		const propertyNumber = propertyIdItem.replace( 'P', '' );
		browser.executeQuickStatement( itemId + '|' + propertyIdItem + '|Q2|S' + propertyNumber + '|Q2|S' + propertyNumber + '|Q2' );

		const response = browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbgetclaims&format=json&entity=' + itemId );
		const refValue = getReferenceValue( response, propertyIdItem, propertyIdItem );

		assert.strictEqual( refValue.id, 'Q2' );
	} );

	it( 'Should be able to add a property with "url" reference', function () {

		const itemId = browser.call( () => WikibaseApi.createItem( 'reference-url', {} ) );
		propertyURL = browser.call( () => WikibaseApi.getProperty( 'url' ) );
		const url = '"https://www.wikidata.org"';
		const propertyNumber = propertyURL.replace( 'P', '' );

		browser.executeQuickStatement( itemId + '|' + propertyIdItem + '|Q1|S' + propertyNumber + '|' + url );

		const response = browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbgetclaims&format=json&entity=' + itemId );
		const refValue = getReferenceValue( response, propertyIdItem, propertyURL );

		assert.strictEqual( refValue, 'https://www.wikidata.org' );
	} );

	it( 'Should be able to add a property with "string" reference', function () {

		const itemId = browser.call( () => WikibaseApi.createItem( 'reference-string', {} ) );
		const stringValue = '"some string"';
		const propertyNumber = propertyId.replace( 'P', '' );
		browser.executeQuickStatement( itemId + '|' + propertyIdItem + '|Q1|S' + propertyNumber + '|' + stringValue );

		const response = browser.makeRequest( process.env.MW_SERVER + '/w/api.php?action=wbgetclaims&format=json&entity=' + itemId );
		const refValue = getReferenceValue( response, propertyIdItem, propertyId );

		assert.strictEqual( refValue, 'some string' );
	} );

	it( 'Should be able to add and remove a property on an item', function () {

		const itemId = browser.call( () => WikibaseApi.createItem( 'add-remove', {} ) );

		browser.executeQuickStatement( itemId + '|' + propertyIdItem + '|Q1' );

		let response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/' + itemId + '.json' );
		assert.strictEqual( ( propertyIdItem in response.data.entities[ itemId ].claims ), true );

		browser.executeQuickStatement( '-' + itemId + '|' + propertyIdItem + '|Q1' );

		response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/' + itemId + '.json' );
		assert.strictEqual( ( propertyIdItem in response.data.entities[ itemId ].claims ), false );

	} );

	it( 'Should be able to merge two items', function () {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		browser.executeQuickStatement( 'MERGE|Q1|Q2' );

		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );
		assert.strictEqual( responseQ2.data.entities.Q1.id, 'Q1' );
	} );

} );
