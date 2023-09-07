'use strict';

const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const path = require( 'path' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'WikibaseLocalMedia', function () {
	let itemId = null;
	let propertyId = null;

	it( 'Should allow to upload an image', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		await LoginPage.loginAdmin();

		await browser.url( process.env.MW_SERVER + '/wiki/Special:Upload/' );

		const fileUpload = await $( '#wpUploadFile' );
		await fileUpload.waitForDisplayed();

		const filePath = path.join( __dirname, '/image.png' );
		await fileUpload.setValue( filePath );

		const submitButtonEl = await $( 'input.mw-htmlform-submit' );
		await submitButtonEl.click();

		const firstHeadingEl = await $( '#firstHeading' );
		await firstHeadingEl.waitForDisplayed();
		const title = await firstHeadingEl.getText();

		assert.strictEqual( title, 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		propertyId = await WikibaseApi.createProperty( 'localMedia' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		await browser.url( process.env.MW_SERVER + '/wiki/Property:' + propertyId );

		const firstHeadingEl = await $( '#firstHeading' );
		await firstHeadingEl.waitForDisplayed();
		const title = await firstHeadingEl.getText();

		assert.strictEqual( title.includes( propertyId ), true );
	} );

	it( 'Should allow to use uploaded image on statement', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );

		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: 'Image.png', type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		itemId = await WikibaseApi.createItem( 'image-test', data );

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		const snakviewEl = await $( '.wikibase-snakview-value img' );
		await snakviewEl.waitForDisplayed();
		const imageSourceEl = await $( '.wikibase-snakview-value img' );
		const imageSource = await imageSourceEl.getAttribute( 'src' );

		assert.strictEqual( imageSource.includes( 'Image.png' ), true );
	} );
} );
