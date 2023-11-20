import assert from 'assert';
import SpecialListProperties from '../../helpers/pages/special/list-properties.page.js';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';

describe( 'Special:NewProperty', function () {
	it( 'Should be able to create a new property', async () => {
		await SpecialNewProperty.open( 'string' );

		await SpecialNewProperty.labelInput.setValue( 'Cool label' );
		await SpecialNewProperty.descriptionInput.setValue( 'Cool description' );
		await SpecialNewProperty.aliasesInput.setValue( 'Great job!|Bra Jobbat' );
		await SpecialNewProperty.submit();

		const dataTypeText = await $(
			'.wikibase-propertyview-datatype-value'
		).getText();
		assert.strictEqual( dataTypeText, 'String' );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async () => {
		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesBefore =
			await SpecialListProperties.properties.length;

		await SpecialNewProperty.open( 'string' );
		await SpecialNewProperty.labelInput.setValue( 'Property type string' );
		await SpecialNewProperty.descriptionInput.setValue( 'A string property' );
		await SpecialNewProperty.submit();

		// wait for the $wgWBRepoSettings['sharedCacheDuration'] cache to
		// timeout, so the list of properties reflects the change
		await browser.pause( 1100 );

		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesAfter =
			await SpecialListProperties.properties.length;

		assert.strictEqual( numberOfPropertiesAfter, numberOfPropertiesBefore + 1 );
	} );

	it( 'Should be able to create a new property of datatype Item', async () => {
		await SpecialNewProperty.open();

		await SpecialNewProperty.labelInput.setValue( 'Cool Item label' );
		await SpecialNewProperty.descriptionInput.setValue( 'Cool Item description' );
		await SpecialNewProperty.aliasesInput.setValue(
			'Great Item!|Greatest Item!'
		);

		await SpecialNewProperty.datatypeInput.click();
		await $( '.oo-ui-labelElement-label=Item' ).click();

		await SpecialNewProperty.submit();

		const dataTypeText = await $(
			'.wikibase-propertyview-datatype-value'
		).getText();
		assert.strictEqual( dataTypeText, 'Item' );
	} );
} );
