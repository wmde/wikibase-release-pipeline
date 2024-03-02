describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async function () {
		await browser.url( testEnv.vars.WIKIBASE_URL );
		await $( '#searchInput' ).click();
		await $( '.imeselector' ).click();

		const firstLang = await $( '.imeselector-menu h3' ).getText();

		expect( firstLang ).toBe( 'English' );
	} );
} );
