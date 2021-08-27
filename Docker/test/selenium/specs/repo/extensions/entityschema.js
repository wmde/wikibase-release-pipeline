'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'EntitySchema', function () {

	const testLabel = 'A label';
	const testDescription = 'A description';

	it( 'Should be able to create an EntitySchema', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'EntitySchema' );

		browser.url( process.env.MW_SERVER + '/wiki/EntitySchema:test' );

		// gives the link to Special:NewEntitySchema
		$( '.noarticletext a' ).waitForDisplayed();
		$( '.noarticletext a' ).click();

		// set label and description
		$( 'input[name ="label"]' ).setValue( testLabel );
		$( 'input[name ="description"]' ).setValue( testDescription );

		// set template
		const shexTemplate = fs.readFileSync( 'data/entityschema.sx', 'utf8' );
		$( 'textarea[name ="schema-text"]' ).setValue( shexTemplate );

		$( 'button[name ="submit"]' ).click();

		$( '#entityschema-schema-text' ).waitForDisplayed();

		const actualTemplate = $( '#entityschema-schema-text' ).getText();
		const actualLabel = $( '.entityschema-title-label' ).getText();
		const actualId = $( '.entityschema-title-id' ).getText();
		const actualDescription = $( '.entityschema-description' ).getText();

		assert( actualDescription === testDescription );
		assert( actualTemplate === shexTemplate );
		assert( actualLabel === testLabel );
		assert( actualId === '(E1)' );

		const linkUrl = $( '.external.entityschema-check-schema' ).getAttribute( 'href' );

		assert( linkUrl.includes( 'http://validator.svc' ) );

	} );

} );
