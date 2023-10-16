import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import awaitDisplayed from '../../../helpers/await-displayed.js';

describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async () => {
		await browser.url( process.env.MW_SERVER );
		const searchInputEl = await awaitDisplayed( '#searchInput' );
		await searchInputEl.click();

		const selectorEl = await awaitDisplayed( '.imeselector' );
		await selectorEl.click();

		const firstLangEl = await awaitDisplayed( '.imeselector-menu h3' );
		const firstLang = await firstLangEl.getText();

		assert.strictEqual( firstLang, 'English' );
	} );
} );
