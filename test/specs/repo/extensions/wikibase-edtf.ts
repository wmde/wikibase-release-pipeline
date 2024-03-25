import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../../helpers/pages/entity/item.page.js';
import SpecialEntityDataPage from '../../../helpers/pages/special/entity-data.page.js';
import SpecialNewPropertyPage from '../../../helpers/pages/special/new-property.page.js';

describe( 'WikibaseEdtf', function () {
	before( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Wikibase EDTF' );
	} );

	it( 'Should allow to create and use the EDTF property', async function () {
		// create the property
		const propertyId = await WikibaseApi.createProperty( 'edtf' );
		expect( propertyId ).toMatch( /^P/ );

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

		expect( responseSnak.datavalue.value ).toEqual( '1985-04-12T23:20:30' );
		expect( responseSnak.datatype ).toEqual( 'edtf' );

		// for a pretty screenshot
		await ItemPage.open( itemId );
	} );

	it( 'Should allow to create and use the EDTF property in UI', async function () {
		// create the property
		await SpecialNewPropertyPage.open( { datatype: 'edtf' } );
		await SpecialNewPropertyPage.labelInput.setValue( 'Groundhog Day Release' );
		await SpecialNewPropertyPage.descriptionInput.setValue(
			'Date on which the film Groundhog Day was broadly released to theaters'
		);
		await SpecialNewPropertyPage.aliasesInput.setValue( 'Groundhog Day Opening' );
		await SpecialNewPropertyPage.submit();

		const itemId = await WikibaseApi.createItem( 'edtf-test' );

		await ItemPage.open( itemId );
		await $( '=add statement' ).click();
		await browser.keys( 'Groundhog Day Release'.split( '' ) );
		await $(
			'span.ui-entityselector-description=Date on which the film Groundhog Day was broadly released to theaters'
		).click();
		const timeValue = '1993-02-12T00:00:00';
		await browser.keys( timeValue.split( '' ) );
		await $( '.wikibase-toolbar-button-save[aria-disabled="false"]' )
			.$( '=save' )
			.click();

		await expect( $( 'span.edtf-plain' ) ).toHaveText( timeValue );
		await expect( $( 'span.edtf-humanized' ) ).toHaveText(
			'(00:00:00 (local time) February 12th, 1993)'
		);
	} );
} );
