'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'VisualEditor', function () {
	it( 'Should be able to edit a page using the editor', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'VisualEditor' );

		await browser.url(
			process.env.MW_SERVER + '/wiki/TestVisualEditor?veaction=edit'
		);

		// start editing
		const messageDialogEl = await $( '.oo-ui-messageDialog-actions' );
		await messageDialogEl.waitForDisplayed();
		const messageDialogAEl = await $$( '.oo-ui-messageDialog-actions a' );
		const startEditbutton = messageDialogAEl[ 1 ];
		await startEditbutton.click();

		await browser.pause( 5 * 1000 );

		// disable notice popup and focus on editor
		const toolLinkEl = await $( '.oo-ui-tool-name-notices .oo-ui-tool-link' );
		await toolLinkEl.waitForDisplayed();
		await toolLinkEl.click();

		const surfaceEl = await $( '.ve-ce-surface' );
		await surfaceEl.waitForDisplayed();
		await surfaceEl.click();

		await browser.keys( [ 'T', 'E', 'S', 'T' ] );

		// save changes
		const saveButtonEl = await $( 'a.ve-ui-toolbar-saveButton' );
		await saveButtonEl.waitForDisplayed();
		await saveButtonEl.click();

		// fill-out for summary popup and submit
		const inputEl = await $( '.oo-ui-inputWidget-input' );
		await inputEl.waitForDisplayed();
		await browser.keys( 'X' );

		const primaryAEl = await $( '.oo-ui-processDialog-actions-primary a' );
		await primaryAEl.waitForDisplayed();
		await primaryAEl.click();

		const outputEl = await $( '.mw-parser-output' );
		await outputEl.waitForDisplayed();
		const contentBody = await outputEl.getText();

		assert.strictEqual( contentBody, 'TEST' );
	} );
} );
