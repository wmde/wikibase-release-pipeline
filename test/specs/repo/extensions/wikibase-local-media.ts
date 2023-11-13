import assert from 'assert';
import SuiteLoginPage from '../../../helpers/pages/SuiteLoginPage.js';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';

describe( 'WikibaseLocalMedia', function () {
	let propertyId: string;

	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Wikibase Local Media' );
	} );

	it( 'Should allow to upload an image', async () => {
		await SuiteLoginPage.loginAdmin();

		await browser.url( process.env.MW_SERVER + '/wiki/Special:Upload/' );

		const filePath = new URL( 'image.png', import.meta.url );
		await $( '#wpUploadFile' ).setValue( filePath.pathname );

		await $( 'input.mw-htmlform-submit' ).click();

		const title = await $( '#firstHeading' ).getText();

		assert.strictEqual( title, 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', async () => {
		propertyId = await WikibaseApi.createProperty( 'localMedia' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		await browser.url( `${process.env.MW_SERVER}/wiki/Property:${propertyId}` );

		const title = await $( '#firstHeading' ).getText();

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
		const imageSource = await $( '.wikibase-snakview-value img' ).getAttribute( 'src' );

		assert.strictEqual( imageSource.includes( 'Image.png' ), true );
	} );
} );
