import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'UniversalLanguageSelector', function () {
	it( 'Should be able to see the language selector menu', async () => {
		skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );

		await browser.url( process.env.MW_SERVER );
		const searchInputEl = await $( '#searchInput' );
		await searchInputEl.waitForDisplayed();
		await searchInputEl.click();

		const selectorEl = await $( '.imeselector' );
		await selectorEl.waitForDisplayed();
		await selectorEl.click();

		const firstLangEl = await $( '.imeselector-menu h3' );
		await firstLangEl.waitForDisplayed();
		const firstLang = await firstLangEl.getText();

		assert.strictEqual( firstLang, 'English' );
	} );
} );
