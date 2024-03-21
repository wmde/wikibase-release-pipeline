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

		await $$( 'div.imeselector' )
			.filter( async ( selector ) => selector.isClickable() )[ 0 ]
			.click();

		await expect(
			$( 'div.imeselector-menu h3.ime-list-title' ).getHTML()
		).resolves.toEqual( '<h3 class="ime-list-title autonym">English</h3>' );
	} );
} );
