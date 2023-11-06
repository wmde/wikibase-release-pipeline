import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'VisualEditor', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'VisualEditor' );
	} );

	it( 'Should be able to edit a page using the editor', async () => {
		await browser.url(
			process.env.MW_SERVER + '/wiki/TestVisualEditor?veaction=edit'
		);

		// start editing
		await ( await $( '.oo-ui-messageDialog-actions' ) ).waitForDisplayed();
		const messageDialogAEl = await $$( '.oo-ui-messageDialog-actions a' );
		await messageDialogAEl[ 1 ].click();

		await browser.pause( 5 * 1000 );

		// disable notice popup and focus on editor
		const toolLinkEl = await $(
			'.oo-ui-tool-name-notices .oo-ui-tool-link'
		);
		await toolLinkEl.click();

		const surfaceEl = await $( '.ve-ce-surface' );
		await surfaceEl.click();

		await browser.keys( [ 'T', 'E', 'S', 'T' ] );

		// save changes
		const saveButtonEl = await $( 'a.ve-ui-toolbar-saveButton' );
		await saveButtonEl.click();

		// fill-out for summary popup and submit
		await $( '.oo-ui-inputWidget-input' );
		await browser.keys( 'X' );

		const primaryAEl = await $(
			'.oo-ui-processDialog-actions-primary a'
		);
		await primaryAEl.click();

		const outputEl = await $( '.mw-parser-output' );
		const contentBody = await outputEl.getText();

		assert.strictEqual( contentBody, 'TEST' );
	} );
} );
