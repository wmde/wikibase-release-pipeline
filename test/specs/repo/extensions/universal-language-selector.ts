describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async function () {
		await browser.url( testEnv.vars.WIKIBASE_URL );

		await $( '#searchform input' ).click();

		// work around lang selector not showing up the first time
		// blur the search bar
		await $( '.page-Main_Page' ).click();
		// focus search bar again, lang selector should be there now
		await $( '#searchform input' ).click();

		await $$( '.imeselector' )
			.filter( async ( selector ) => selector.isClickable() )[ 0 ]
			.click();

		// we need to use getHTML, getText() is the empty string for some reason,
		// does it think the element is hidden?
		await expect(
			$( 'div.imeselector-menu h3.ime-list-title' ).getHTML()
		).resolves.toMatch( /English/ );
	} );
} );
