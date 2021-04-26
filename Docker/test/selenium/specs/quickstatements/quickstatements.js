'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const defaultFunctions = require( '../../helpers/default-functions' );
const _ = require( 'lodash' );

describe( 'QuickStatements Service', function () {

	let propertyId = null;
	let propertyIdItem = null;
	let propertyURL = null;

	before( function () {
		defaultFunctions();
	} );

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

		assert( responseQ1.data.entities.Q1.id === 'Q1' );
		assert( responseQ2.data.entities.Q2.id === 'Q2' );
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

	it( 'Should be able to add a property to an item', function () {

		propertyId = browser.call( () => WikibaseApi.getProperty( 'string' ) );

		browser.executeQuickStatement( 'Q1|' + propertyId + '|"Will it blend?"' );

		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		assert( responseQ1.data.entities.Q1.claims[ propertyId ][ 0 ].type === 'statement' );

	} );

	it( 'Should be able to add statement with qualifiers', function () {

		propertyIdItem = browser.call( () => WikibaseApi.getProperty( 'wikibase-item' ) );

		browser.executeQuickStatement( 'Q1|' + propertyIdItem + '|Q1|' + propertyIdItem + '|Q1' );

		const responseQ1 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q1.json' );
		assert( responseQ1.data.entities.Q1.claims[ propertyId ][ 0 ].type === 'statement' );

	} );

	it( 'Should be able to add a property with "wikibase-item" reference', function () {

		propertyIdItem = browser.call( () => WikibaseApi.getProperty( 'wikibase-item' ) );
		const propertyNumber = propertyIdItem.replace( 'P', '' );
		browser.executeQuickStatement( 'Q2|' + propertyIdItem + '|Q2|S' + propertyNumber + '|Q2|S' + propertyNumber + '|Q2' );

		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );
		assert( ( propertyIdItem in responseQ2.data.entities.Q2.claims ) === true );
	} );

	it( 'Should be able to add a property with "url" reference', function () {

		propertyURL = browser.call( () => WikibaseApi.getProperty( 'url' ) );
		const url = '"https://www.wikidata.org"';
		const propertyNumber = propertyURL.replace( 'P', '' );
		browser.executeQuickStatement( 'Q2|' + propertyIdItem + '|Q3|S' + propertyNumber + '|' + url );

		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );
		assert( ( propertyURL in responseQ2.data.entities.Q2.claims ) === true );
	} );

	it( 'Should be able to add a property with "string" reference', function () {

		const stringValue = '"some string"';
		const propertyNumber = propertyId.replace( 'P', '' );
		browser.executeQuickStatement( 'Q2|' + propertyIdItem + '|Q3|S' + propertyNumber + '|' + stringValue );

		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );
		assert( ( propertyURL in responseQ2.data.entities.Q2.claims ) === true );
	} );

	it( 'Should be able to create another item', function () {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		browser.executeQuickStatement( 'CREATE' );

		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q3.json' );

		assert( response.data.entities.Q3.id === 'Q3' );
	} );

	it( 'Should be able to add and remove a property on an item', function () {

		browser.executeQuickStatement( 'Q3|' + propertyIdItem + '|Q1' );

		let responseQ3 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q3.json' );
		assert( ( propertyIdItem in responseQ3.data.entities.Q3.claims ) === true );

		browser.executeQuickStatement( '-Q3|' + propertyIdItem + '|Q1' );

		responseQ3 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q3.json' );
		assert( ( propertyIdItem in responseQ3.data.entities.Q3.claims ) === false );

	} );

	it( 'Should be able to merge two items', function () {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		browser.executeQuickStatement( 'MERGE|Q1|Q2' );

		const responseQ2 = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/Q2.json' );
		assert( responseQ2.data.entities.Q1.id === 'Q1' );
	} );

} );
