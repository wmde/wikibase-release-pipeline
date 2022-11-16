'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const path = require( 'path' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'WikibaseLocalMedia', function () {

	let itemId = null;
	let propertyId = null;

	it( 'Should allow to upload an image', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		LoginPage.loginAdmin();

		browser.url( process.env.MW_SERVER + '/wiki/Special:Upload/' );

		$( '#wpUploadFile' ).waitForDisplayed();

		const fileUpload = $( '#wpUploadFile' );
		const filePath = path.join( __dirname, '../../../data/image.png' );
		fileUpload.setValue( filePath );

		$( 'input.mw-htmlform-submit' ).click();

		$( '#firstHeading' ).waitForDisplayed();
		const title = $( '#firstHeading' ).getText();

		assert.strictEqual( title, 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		propertyId = browser.call( () => WikibaseApi.createProperty( 'localMedia' ) );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		browser.url( process.env.MW_SERVER + '/wiki/Property:' + propertyId );

		$( '#firstHeading' ).waitForDisplayed();
		const title = $( '#firstHeading' ).getText();

		assert.strictEqual( title.includes( propertyId ), true );
	} );

	it( 'Should allow to use uploaded image on statement', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: 'Image.png', type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		itemId = browser.call(
			() => WikibaseApi.createItem( 'image-test', data )
		);

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-snakview-value img' ).waitForDisplayed();
		const imageSource = $( '.wikibase-snakview-value img' ).getAttribute( 'src' );

		assert.strictEqual( imageSource.includes( 'Image.png' ), true );

	} );

} );
