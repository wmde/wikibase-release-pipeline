'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'VisualEditor', function () {

	it( 'Should be able to edit a page using the editor', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'VisualEditor' );

		browser.url( process.env.MW_SERVER + '/wiki/TestVisualEditor?veaction=edit' );

		// start editing
		$( '.oo-ui-messageDialog-actions' ).waitForDisplayed();
		const startEditbutton = $$( '.oo-ui-messageDialog-actions a' )[ 1 ];
		startEditbutton.click();

		browser.pause( 5 * 1000 );

		// disable notice popup and focus on editor
		$( '.oo-ui-tool-name-notices .oo-ui-tool-link' ).waitForDisplayed();
		$( '.oo-ui-tool-name-notices .oo-ui-tool-link' ).click();
		$( '.ve-ce-surface' ).click();

		browser.keys( 'T' );
		browser.keys( 'E' );
		browser.keys( 'S' );
		browser.keys( 'T' );

		// save changes
		$( 'a.ve-ui-toolbar-saveButton' ).waitForDisplayed();
		$( 'a.ve-ui-toolbar-saveButton' ).click();

		// fill-out for summary popup and submit
		$( '.oo-ui-inputWidget-input' ).waitForDisplayed();
		browser.keys( 'X' );
		$( '.oo-ui-processDialog-actions-primary a' ).click();

		$( '.mw-parser-output' ).waitForDisplayed();
		const contentBody = $( '.mw-parser-output' ).getText();

		assert.strictEqual( contentBody, 'TEST' );
	} );

} );
