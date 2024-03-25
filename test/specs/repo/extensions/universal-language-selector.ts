import page from '../../../helpers/pages/page.js';

describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async function () {
		await page.open( '' );

		await $( '#searchform input' ).click();

		// work around lang selector not showing up the first time
		// blur the search bar
		await $( '.page-Main_Page' ).click();
		// focus search bar again, lang selector should be there now
		await $( '#searchform input' ).click();

		await $$( '.imeselector' )
			.filter( async ( selector ) => selector.isClickable() )[ 0 ]
			.click();

		// We need to use getHTML(). If an element isn't interactable
		// getText() returns an empty string.
		// https://webdriver.io/docs/api/element/getText/
		await expect(
			$( 'div.imeselector-menu h3.ime-list-title' ).getHTML()
		).resolves.toMatch( /English/ );
	} );
} );
