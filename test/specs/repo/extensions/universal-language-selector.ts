import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import envVars from '../../../setup/envVars.js';

describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async () => {
		await browser.url( envVars.WIKIBASE_URL );
		await $( '#searchInput' ).click();
		await $( '.imeselector' ).click();

		const firstLang = await $( '.imeselector-menu h3' ).getText();

		assert.strictEqual( firstLang, 'English' );
	} );
} );
