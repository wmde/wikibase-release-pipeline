import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async () => {
		await browser.url( globalThis.env.MW_SERVER );
		await $( '#searchInput' ).click();
		await $( '.imeselector' ).click();

		const firstLang = await $( '.imeselector-menu h3' ).getText();

		assert.strictEqual( firstLang, 'English' );
	} );
} );
