'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../helpers/default-functions' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const Property = require( '../../pages/entity/property.page' );

describe( 'Property', function () {

	let propertyId = null;

	before( function () {
		defaultFunctions();
	} );

	it( 'Should be able to add statement and reference to property', function () {

		propertyId = browser.call( () => WikibaseApi.getProperty( 'string' ) );

		Property.open( propertyId );
		Property.addStatement.waitForDisplayed();
		Property.addStatement.click();

		browser.keys( [ 'P', '1' ] );
		$( '=P1 (P1)' ).waitForDisplayed();
		$( '=P1 (P1)' ).click();
		browser.keys( [ 'S', 'T', 'A', 'T', 'E', 'M', 'E', 'N', 'T' ] );

		browser.pause( 1000 * 1 );
		Property.save.click();
		browser.pause( 1000 * 2 );

		Property.addReference.waitForDisplayed();
		Property.addReference.click();

		$( '.ui-entityselector-input' ).waitForDisplayed();

		browser.keys( [ 'P', '1' ] );
		$( '=P1 (P1)' ).waitForDisplayed();
		$( '=P1 (P1)' ).click();
		browser.keys( [ 'R', 'E', 'F', 'E', 'R', 'E', 'N', 'C', 'E' ] );

		browser.pause( 1000 * 1 );
		Property.save.click();

		Property.open( 'P1' );
	} );

	it( 'Should contain statement and reference in EntityData', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/' + propertyId + '.json' );
		const body = response.data;
		const claim = body.entities.P1.claims[ propertyId ][ 0 ];
		const reference = claim.references[ 0 ].snaks[ propertyId ][ 0 ];

		assert( claim.mainsnak.datavalue.value === 'STATEMENT' );
		assert( reference.datavalue.value === 'REFERENCE' );
	} );
} );
