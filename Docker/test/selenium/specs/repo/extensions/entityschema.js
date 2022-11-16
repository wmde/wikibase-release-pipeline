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

		const actualTemplate = $( '#entityschema-schema-text' ).getText().trim();
		const actualTemplateHtml = $( '#entityschema-schema-text' ).getHTML().trim();
		const actualLabel = $( '.entityschema-title-label' ).getText().trim();
		const actualId = $( '.entityschema-title-id' ).getText().trim();
		const actualDescription = $( '.entityschema-description' ).getText().trim();

		assert.strictEqual( actualDescription, testDescription );
		assert.strictEqual( actualTemplate, shexTemplate );
		assert.strictEqual( actualLabel, testLabel );
		assert.strictEqual( actualId, '(E1)' );
		assert.ok( actualTemplateHtml.includes( 'mw-highlight' ), 'Should contain mw-highlight class in HTML' );

		const linkUrl = $( '.external.entityschema-check-schema' ).getAttribute( 'href' );

		assert( linkUrl.includes( 'http://validator.svc' ) );

	} );

} );
