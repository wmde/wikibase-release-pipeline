'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const Property = require( '../../pages/entity/property.page' );

describe( 'Property', function () {

	let propertyId = null;

	it( 'Should be able to add statement and reference to property', function () {

		propertyId = browser.call( () => WikibaseApi.getProperty( 'string' ) );

		const propertyIdSelector = '=' + propertyId + ' (' + propertyId + ')'; // =P1 (P1)

		Property.open( propertyId );
		Property.addStatement.waitForDisplayed();
		Property.addStatement.click();

		// fill out property id for statement
		browser.keys( propertyId.split( '' ) );
		$( propertyIdSelector ).waitForDisplayed();
		$( propertyIdSelector ).click();
		browser.keys( [ 'S', 'T', 'A', 'T', 'E', 'M', 'E', 'N', 'T' ] );

		// wait for save button to re-enable
		browser.pause( 1000 * 1 );
		Property.save.click();
		browser.pause( 1000 * 2 );

		Property.addReference.waitForDisplayed();
		Property.addReference.click();

		// fill out property id for reference
		$( '.ui-entityselector-input' ).waitForDisplayed();
		browser.keys( propertyId.split( '' ) );
		$( propertyIdSelector ).waitForDisplayed();
		$( propertyIdSelector ).click();
		browser.keys( [ 'R', 'E', 'F', 'E', 'R', 'E', 'N', 'C', 'E' ] );

		browser.pause( 1000 * 1 );
		Property.save.click();

		Property.open( propertyId );
	} );

	it( 'Should contain statement and reference in EntityData', function () {
		const response = browser.makeRequest( process.env.MW_SERVER + '/wiki/Special:EntityData/' + propertyId + '.json' );
		const body = response.data;
		const claim = body.entities[ propertyId ].claims[ propertyId ][ 0 ];
		const reference = claim.references[ 0 ].snaks[ propertyId ][ 0 ];

		assert.strictEqual( claim.mainsnak.datavalue.value, 'STATEMENT' );
		assert.strictEqual( reference.datavalue.value, 'REFERENCE' );
	} );
} );
