import LoginPage from 'wdio-mediawiki/LoginPage.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import Statement from '../../../helpers/pages/component/statement.js';
import ItemPage from '../../../helpers/pages/entity/item.page.js';
import PropertyPage from '../../../helpers/pages/entity/property.page.js';
import { Claim } from '../../../types/entity-data.js';

describe( 'WikibaseLocalMedia', function () {
	let propertyId: string;
	let propertyLabel: string;

	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Wikibase Local Media' );
	} );

	it( 'Should allow to upload an image', async () => {
		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);

		await browser.url( `${testEnv.vars.WIKIBASE_URL}/wiki/Special:Upload/` );

		const filePath = new URL( 'image.png', import.meta.url );
		await $( '#wpUploadFile' ).setValue( filePath.pathname );

		await $( 'input.mw-htmlform-submit' ).click();

		await expect( $( '#firstHeading' ) ).toHaveText( 'File:Image.png' );
	} );

	it( 'Should allow to create a property with localMedia datatype', async () => {
		propertyId = await WikibaseApi.createProperty( 'localMedia' );
		expect( propertyId.startsWith( 'P' ) ).toBe( true );

		await PropertyPage.open( propertyId );

		propertyLabel = await $( '#firstHeading' ).getText();
		await expect( $( '#firstHeading' ) ).toHaveTextContaining( propertyId );
	} );

	it( 'Should allow to use uploaded image on statement', async () => {
		const data: { claims: Claim[] } = {
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
		await expect( $( '.wikibase-snakview-value img' ) ).toHaveAttributeContaining(
			'src',
			'Image.png'
		);
	} );

	it( 'Should allow to use uploaded image on statement in UI', async () => {
		const itemId = await WikibaseApi.createItem( 'image-test-2' );
		await ItemPage.open( itemId );

		await Statement.addStatementLink.click();
		await Statement.selectProperty( propertyId, propertyLabel );
		await browser.keys( 'image.png'.split( '' ) );
		await $( 'ul.ui-mediasuggester-list' )
			.$( 'a' )
			.$( 'span[title="Image.png"]' )
			.click();

		await $( '.wikibase-toolbar-button-save[aria-disabled="false"]' )
			.$( '=save' )
			.click();

		await expect( $( 'div.commons-media-caption' ).$( 'a' ) ).toHaveText( 'Image.png' );
	} );
} );
