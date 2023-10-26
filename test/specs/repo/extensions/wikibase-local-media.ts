import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import awaitDisplayed from '../../../helpers/await-displayed.js';

describe( 'WikibaseLocalMedia', function () {
	let propertyId: string;

	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Wikibase Local Media' );
	} );

	it( 'Should allow to upload an image', async () => {
		await LoginPage.loginAdmin();

		await browser.url( process.env.MW_SERVER + '/wiki/Special:Upload/' );

		const fileUpload = await awaitDisplayed( '#wpUploadFile' );
		const filePath = new URL( 'image.png', import.meta.url );
		await fileUpload.setValue( filePath.pathname );

		const submitButtonEl = await awaitDisplayed( 'input.mw-htmlform-submit' );
		await submitButtonEl.click();

		const firstHeadingEl = await awaitDisplayed( '#firstHeading' );
		const title = await firstHeadingEl.getText();

		assert.strictEqual( title, 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', async () => {
		propertyId = await WikibaseApi.createProperty( 'localMedia' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		await browser.url( `${process.env.MW_SERVER}/wiki/Property:${propertyId}` );

		const firstHeadingEl = await awaitDisplayed( '#firstHeading' );
		const title = await firstHeadingEl.getText();

		assert.strictEqual( title.includes( propertyId ), true );
	} );

	it( 'Should allow to use uploaded image on statement', async () => {
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

		const itemId = await WikibaseApi.createItem( 'image-test', data );

		await browser.url( `${process.env.MW_SERVER}/wiki/Item:${itemId}` );
		await awaitDisplayed( '.wikibase-snakview-value img' );
		const imageSourceEl = await awaitDisplayed( '.wikibase-snakview-value img' );
		const imageSource = await imageSourceEl.getAttribute( 'src' );

		assert.strictEqual( imageSource.includes( 'Image.png' ), true );
	} );
} );
