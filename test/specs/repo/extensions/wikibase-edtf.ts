import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../../helpers/pages/entity/item.page.js';
import SpecialEntityDataPage from '../../../helpers/pages/special/entity-data.page.js';
import SpecialNewPropertyPage from '../../../helpers/pages/special/new-property.page.js';
import propertyIdSelector from '../../../helpers/property-id-selector.js';

describe( 'WikibaseEdtf', function () {
	before( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Wikibase EDTF' );
	} );

	it( 'Should allow to create and use the EDTF property', async () => {
		// create the property
		const propertyId = await WikibaseApi.createProperty( 'edtf' );
		assert.strictEqual( propertyId.startsWith( 'P' ), true );

		const rawValue = '1985-04-12T23:20:30';

		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: rawValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		const itemId = await WikibaseApi.createItem( 'edtf-test', data );

		// go look at wikibase
		const responseData = await SpecialEntityDataPage.getData( itemId );
		const responseSnak =
			responseData.entities[ itemId ].claims[ propertyId ][ 0 ].mainsnak;

		assert.strictEqual( responseSnak.datavalue.value, '1985-04-12T23:20:30' );
		assert.strictEqual( responseSnak.datatype, 'edtf' );

		// for a pretty screenshot
		await ItemPage.open( itemId );
	} );

	it( 'Should allow to create and use the EDTF property in UI', async () => {
		// create the property
		await SpecialNewPropertyPage.open( { datatype: 'edtf' } );
		await SpecialNewPropertyPage.labelInput.setValue( 'Jurassic Park Release' );
		await SpecialNewPropertyPage.descriptionInput.setValue(
			'Date on which Jurassic Park was broadly released to theaters'
		);
		await SpecialNewPropertyPage.aliasesInput.setValue(
			'Jurassic Park Day|Jurassic Park Opening'
		);
		await SpecialNewPropertyPage.submit();

		const propertyId = (
			await $( 'h1#firstHeading' ).$( 'span.wikibase-title-id' ).getText()
		).replace( /[()]/g, '' );

		const itemId = await WikibaseApi.createItem( 'edtf-test' );

		await ItemPage.open( itemId );
		await $( '=add statement' ).click();
		await browser.keys( 'Jurassic Park Release'.split( '' ) );
		await propertyIdSelector( propertyId ).click();
		const timeValue = '1993-06-11T00:00:00';
		await browser.keys( timeValue.split( '' ) );
		await $( '.wikibase-toolbar-button-save[aria-disabled="false"]' )
			.$( '=save' )
			.click();

		expect( await $( 'span.edtf-plain' ).getText() ).toEqual( timeValue );
		expect( await $( 'span.edtf-humanized' ).getText() ).toEqual(
			'(00:00:00 (local time) June 11th, 1993)'
		);
	} );
} );
