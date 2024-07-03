import { parseSemVer } from 'semver-parser';
import page from '../../../helpers/pages/page.js';

describe( 'UniversalLanguageSelector', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'UniversalLanguageSelector' );
	} );

	it( 'Should be able to see the language selector menu', async function () {
		await page.open( '' );

		// MediaWiki 1.39 default skin sets up language selector differently than subsequent versions,
		// this exception can be removed once MW 1.39 is no longer supported.
		if ( parseSemVer( testEnv.vars.MEDIAWIKI_VERSION ).minor > 39 ) {
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
		} else {
			await $( '#searchInput' ).click();
			await $( '.imeselector' ).click();

			await expect( $( '.imeselector-menu h3' ) ).toHaveText( 'English' );
		}
	} );
} );
