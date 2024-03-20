describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async function () {
		await browser.url( testEnv.vars.WIKIBASE_URL );
		await $( '#searchInput' ).click();

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 1 * 1000 );

		await $$( 'div.imeselector' )
			.filter( async ( selector ) => selector.isClickable() )[ 0 ]
			.click();

		await expect(
			$( 'div.imeselector-menu h3.ime-list-title' ).getHTML()
		).resolves.toEqual( '<h3 class="ime-list-title autonym">English</h3>' );
	} );
} );
