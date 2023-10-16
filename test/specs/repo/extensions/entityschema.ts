import assert from 'assert';
import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/readFileEncoding.js';
import awaitDisplayed from '../../../helpers/awaitDisplayed.js';

describe( 'EntitySchema', function () {
	const testLabel = 'A label';
	const testDescription = 'A description';

	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'EntitySchema' );
	} );

	it( 'Should be able to create an EntitySchema', async () => {
		await browser.url( process.env.MW_SERVER + '/wiki/EntitySchema:test' );

		// gives the link to Special:NewEntitySchema
		const noarticletextEl = await awaitDisplayed( '.noarticletext a' );
		await noarticletextEl.click();

		// set label and description
		const labelInputEl = await awaitDisplayed( 'input[name ="label"]' );
		await labelInputEl.setValue( testLabel );
		const descriptionInputEl = await awaitDisplayed(
			'input[name ="description"]'
		);
		await descriptionInputEl.setValue( testDescription );

		// set template
		const shexTemplate = (
			await readFile( new URL( 'entityschema.sx', import.meta.url ), utf8 )
		)
			.toString()
			.trim();
		const schemaTextInputEl = await awaitDisplayed(
			'textarea[name ="schema-text"]'
		);
		await schemaTextInputEl.setValue( shexTemplate );

		const submitButtonEl = await awaitDisplayed( 'button[name ="submit"]' );
		await submitButtonEl.click();

		await awaitDisplayed( '#entityschema-schema-text' );

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
