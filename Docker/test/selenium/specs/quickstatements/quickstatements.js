'use strict';

const assert = require( 'assert' );

describe( 'QuickStatements Service', function () {

	it( 'Should be able to load the start page', function () {
		browser.url( process.env.QS_SERVER );
		$( 'nav.navbar' ).waitForDisplayed();
	} );

	it( 'Should be able to log in', function () {

		browser.url( process.env.QS_SERVER + '/api.php?action=oauth_redirect' );

		// login after redirect
		$( '#wpPassword1' ).waitForDisplayed();

		$( '#wpName1' ).setValue( process.env.MW_ADMIN_NAME );
		$( '#wpPassword1' ).setValue( process.env.MW_ADMIN_PASS );
		$( '#wpLoginAttempt' ).click();

		// oauth dialog
		$( '#mw-mwoauth-authorize-dialog' ).waitForDisplayed();
		$( '#mw-mwoauth-accept' ).click();

		// redirect back to app
		$( 'nav.navbar' ).waitForDisplayed();
		const navbar = $( 'nav.navbar' ).getText();
		assert( navbar.includes( 'QuickStatements' ) );
	} );

	it( 'Should be able to create a new item and view it', function () {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		// create a batch
		$( '.create_batch_box textarea' ).waitForDisplayed();
		$( '.create_batch_box textarea' ).setValue( 'CREATE' );

		// click import
		$( "button[tt='dialog_import_v1']" ).click();

		// click run
		$( "button[tt='run']" ).waitForDisplayed();
		$( "button[tt='run']" ).click();

		// wait for the creating
		browser.pause( 5000 );

		// go look at wikibase
		browser.url( process.env.MW_SERVER + '/wiki/Item:Q1' );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();

	} );

} );
