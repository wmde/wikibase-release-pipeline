'use strict';

const assert = require( 'assert' );
const fsPromises = require( 'fs/promises' );
const defaultFunctions = require( '../../../helpers/default-functions' );
const readFileEncoding = require( '../../../helpers/readFileEncoding' );

describe( 'EntitySchema', function () {
	const testLabel = 'A label';
	const testDescription = 'A description';

	it( 'Should be able to create an EntitySchema', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'EntitySchema' );

		await browser.url( process.env.MW_SERVER + '/wiki/EntitySchema:test' );

		// gives the link to Special:NewEntitySchema
		const noarticletextEl = await $( '.noarticletext a' );
		await noarticletextEl.waitForDisplayed();
		await noarticletextEl.click();

		// set label and description
		const labelInputEl = await $( 'input[name ="label"]' );
		await labelInputEl.setValue( testLabel );
		const descriptionInputEl = await $( 'input[name ="description"]' );
		await descriptionInputEl.setValue( testDescription );

		// set template
		const shexTemplate = await fsPromises.readFile(
			__dirname + '/entityschema.sx',
			readFileEncoding.utf8
		);
		const schemaTextInputEl = await $( 'textarea[name ="schema-text"]' );
		await schemaTextInputEl.setValue( shexTemplate );

		const submitButtonEl = await $( 'button[name ="submit"]' );
		await submitButtonEl.click();

		const schemaTextEl = await $( '#entityschema-schema-text' );
		await schemaTextEl.waitForDisplayed();

		const entitySchemaEl = await $( '#entityschema-schema-text' );
		const actualTemplate = ( await entitySchemaEl.getText() ).trim();
		const actualTemplateHtml = ( await entitySchemaEl.getHTML() ).trim();
		const actualLabelEl = await $( '.entityschema-title-label' );
		const actualLabel = ( await actualLabelEl.getText() ).trim();
		const actualIdEl = await $( '.entityschema-title-id' );
		const actualId = ( await actualIdEl.getText() ).trim();
		const actualDescriptionEl = await $( '.entityschema-description' );
		const actualDescription = ( await actualDescriptionEl.getText() ).trim();

		assert.strictEqual( actualDescription, testDescription );
		assert.strictEqual( actualTemplate, shexTemplate );
		assert.strictEqual( actualLabel, testLabel );
		assert.strictEqual( actualId, '(E1)' );
		assert.ok(
			actualTemplateHtml.includes( 'mw-highlight' ),
			'Should contain mw-highlight class in HTML'
		);

		const linkUrlEl = await $( '.external.entityschema-check-schema' );
		const linkUrl = await linkUrlEl.getAttribute( 'href' );

		assert( linkUrl.includes( 'http://validator.svc' ) );
	} );
} );
