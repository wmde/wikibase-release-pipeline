import assert from 'assert';
import fsPromises from 'fs/promises';
import defaultFunctions from '../../../helpers/default-functions';
import { utf8 } from '../../../helpers/readFileEncoding.js';

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
		await labelInputEl.waitForDisplayed();
		await labelInputEl.setValue( testLabel );
		const descriptionInputEl = await $( 'input[name ="description"]' );
		await labelInputEl.waitForDisplayed();
		await descriptionInputEl.setValue( testDescription );

		// set template
		const shexTemplate = (
			await fsPromises.readFile( new URL( 'entityschema.sx', import.meta.url ), utf8 )
		).trim();
		const schemaTextInputEl = await $( 'textarea[name ="schema-text"]' );
		await schemaTextInputEl.waitForDisplayed();
		await schemaTextInputEl.setValue( shexTemplate );

		const submitButtonEl = await $( 'button[name ="submit"]' );
		await submitButtonEl.waitForDisplayed();
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
