import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import awaitDisplayed from '../../../helpers/await-displayed.js';

describe( 'VisualEditor', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'VisualEditor' );
	} );

	it( 'Should be able to edit a page using the editor', async () => {
		await browser.url(
			process.env.MW_SERVER + '/wiki/TestVisualEditor?veaction=edit'
		);

		// start editing
		await awaitDisplayed( '.oo-ui-messageDialog-actions' );
		const messageDialogAEl = await $$( '.oo-ui-messageDialog-actions a' );
		const startEditbutton = await awaitDisplayed( messageDialogAEl[ 1 ] );
		await startEditbutton.click();

		await browser.pause( 5 * 1000 );

		// disable notice popup and focus on editor
		const toolLinkEl = await awaitDisplayed(
			'.oo-ui-tool-name-notices .oo-ui-tool-link'
		);
		await toolLinkEl.click();

		const surfaceEl = await awaitDisplayed( '.ve-ce-surface' );
		await surfaceEl.click();

		await browser.keys( [ 'T', 'E', 'S', 'T' ] );

		// save changes
		const saveButtonEl = await awaitDisplayed( 'a.ve-ui-toolbar-saveButton' );
		await saveButtonEl.click();

		// fill-out for summary popup and submit
		await awaitDisplayed( '.oo-ui-inputWidget-input' );
		await browser.keys( 'X' );

		const primaryAEl = await awaitDisplayed(
			'.oo-ui-processDialog-actions-primary a'
		);
		await primaryAEl.click();

		const outputEl = await awaitDisplayed( '.mw-parser-output' );
		const contentBody = await outputEl.getText();

		assert.strictEqual( contentBody, 'TEST' );
	} );
} );
