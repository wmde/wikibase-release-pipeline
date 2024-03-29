import page from '../../../helpers/pages/page.js';

describe( 'VisualEditor', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'VisualEditor' );
	} );

	it( 'Should be able to edit a page using the editor', async function () {
		await page.open( '/wiki/TestVisualEditor?veaction=edit' );

		// start editing
		await $( '.oo-ui-messageDialog-actions' ).waitForDisplayed();
		const messageDialogAEl = await $$( '.oo-ui-messageDialog-actions a' );
		await messageDialogAEl[ 1 ].click();

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 5 * 1000 );

		// disable notice popup and focus on editor
		await $( '.oo-ui-tool-name-notices .oo-ui-tool-link' ).click();
		await $( '.ve-ce-surface' ).click();

		await browser.keys( [ 'T', 'E', 'S', 'T' ] );

		// save changes
		await $( 'a.ve-ui-toolbar-saveButton' ).click();

		// fill-out for summary popup and submit
		await $( '.oo-ui-inputWidget-input' );
		await browser.keys( 'X' );

		await $( '.oo-ui-processDialog-actions-primary a' ).click();

		await expect( $( '.mw-parser-output' ) ).toHaveText( 'TEST' );
	} );
} );
