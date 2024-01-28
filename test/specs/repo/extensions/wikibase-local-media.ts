import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../../helpers/pages/entity/item.page.js';
import PropertyPage from '../../../helpers/pages/entity/property.page.js';
import SpecialUploadPage from '../../../helpers/pages/special/upload.page.js';
import { Claim } from '../../../types/entity-data.js';

describe( 'WikibaseLocalMedia', function () {
	let propertyId: string;

	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );
	} );

	it( 'Should allow to upload an image', async () => {
		await LoginPage.login( testEnv.vars.MW_ADMIN_NAME, testEnv.vars.MW_ADMIN_PASS );

		await SpecialUploadPage.open();

		const filePath = new URL( 'image.png', import.meta.url );
		await SpecialUploadPage.uploadFileInput.setValue( filePath.pathname );

		await SpecialUploadPage.submit();

		const title = await SpecialUploadPage.firstHeading.getText();

		assert.strictEqual( title, 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', async () => {
		propertyId = await WikibaseApi.createProperty( 'localMedia' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		await PropertyPage.open( propertyId );

		const title = await PropertyPage.firstHeading.getText();

		assert.strictEqual( title.includes( propertyId ), true );
	} );

	it( 'Should allow to use uploaded image on statement', async () => {
		const data: {claims: Claim[]} = {
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

		await ItemPage.open( itemId );
		const imageSource = await ItemPage.image.getAttribute( 'src' );

		assert.strictEqual( imageSource.includes( 'Image.png' ), true );
	} );
} );
