import { readFile } from 'fs/promises';
import { utf8 } from '../../../helpers/read-file-encoding.js';

describe( 'EntitySchema', function () {
	const testLabel = 'A label';
	const testDescription = 'A description';

	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'EntitySchema' );
	} );

	it( 'Should be able to create an EntitySchema', async function () {
		await browser.url( testEnv.vars.WIKIBASE_URL + '/wiki/EntitySchema:test' );

		// gives the link to Special:NewEntitySchema
		await $( '.noarticletext a' ).click();

		// set label and description
		await $( 'input[name ="label"]' ).setValue( testLabel );
		await $( 'input[name ="description"]' ).setValue( testDescription );

		// set template
		const shexTemplate =
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			( await readFile( new URL( 'entityschema.sx', import.meta.url ), utf8 ) )
				.toString()
				.trim();
		await $( 'textarea[name ="schema-text"]' ).setValue( shexTemplate );

		await $( 'button[name ="submit"]' ).click();

		await $( '#entityschema-schema-text' );

		const entitySchemaEl = $( '#entityschema-schema-text' );
		await expect( $( '.entityschema-description' ) ).toHaveText( testDescription );
		await expect( entitySchemaEl ).toHaveText( shexTemplate );
		await expect( $( '.entityschema-title-label' ) ).toHaveText( testLabel );
		await expect( $( '.entityschema-title-id' ) ).toHaveText( '(E1)' );
		await expect( entitySchemaEl.$( 'div' ) ).toHaveElementClass( 'mw-highlight' );

		await expect( $( '.external.entityschema-check-schema' ) ).toHaveAttr(
			'href',
			/http:\/\/validator\.svc/
		);
	} );
} );
