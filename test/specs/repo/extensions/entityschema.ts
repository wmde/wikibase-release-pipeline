import assert from 'assert';
import { readFile } from 'fs/promises';
import { utf8 } from '../../../helpers/readFileEncoding.js';

describe( 'EntitySchema', function () {
	const testLabel = 'A label';
	const testDescription = 'A description';

	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'EntitySchema' );
	} );

	it( 'Should be able to create an EntitySchema', async () => {
		await browser.url( testEnv.vars.WIKIBASE_URL + '/wiki/EntitySchema:test' );

		// gives the link to Special:NewEntitySchema
		await $( '.noarticletext a' ).click();

		// set label and description
		await $( 'input[name ="label"]' ).setValue( testLabel );
		await $( 'input[name ="description"]' ).setValue( testDescription );

		// set template
		const shexTemplate = (
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await readFile( new URL( 'entityschema.sx', import.meta.url ), utf8 )
		)
			.toString()
			.trim();
		await $( 'textarea[name ="schema-text"]' ).setValue( shexTemplate );

		await $( 'button[name ="submit"]' ).click();

		await $( '#entityschema-schema-text' );

		const entitySchemaEl = await $( '#entityschema-schema-text' );
		const actualTemplate = ( await entitySchemaEl.getText() ).trim();
		const actualTemplateHtml = ( await entitySchemaEl.getHTML() ).trim();
		const actualLabel = ( await $( '.entityschema-title-label' ).getText() ).trim();
		const actualId = ( await $( '.entityschema-title-id' ).getText() ).trim();
		const actualDescription = ( await $( '.entityschema-description' ).getText() ).trim();

		assert.strictEqual( actualDescription, testDescription );
		assert.strictEqual( actualTemplate, shexTemplate );
		assert.strictEqual( actualLabel, testLabel );
		assert.strictEqual( actualId, '(E1)' );
		assert.ok(
			actualTemplateHtml.includes( 'mw-highlight' ),
			'Should contain mw-highlight class in HTML'
		);

		const linkUrl = await $( '.external.entityschema-check-schema' ).getAttribute( 'href' );

		assert( linkUrl.includes( 'http://validator.svc' ) );
	} );
} );
