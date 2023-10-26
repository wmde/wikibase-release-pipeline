import assert from 'assert';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';
import SpecialListProperties from '../../helpers/pages/special/list-properties.page.js';
import awaitDisplayed from '../../helpers/await-displayed.js';

describe( 'Special:NewProperty', function () {
	it( 'Should be able to create a new property', async () => {
		await SpecialNewProperty.open( 'string' );

		await SpecialNewProperty.labelInput.setValue( 'Cool label' );
		await SpecialNewProperty.descriptionInput.setValue( 'Cool description' );
		await SpecialNewProperty.aliasesInput.setValue( 'Great job!|Bra Jobbat' );
		await SpecialNewProperty.submit();

		const propertyviewDatatypeValueEl = await awaitDisplayed(
			'.wikibase-propertyview-datatype-value'
		);
		const dataTypeText = await propertyviewDatatypeValueEl.getText();
		assert.strictEqual( dataTypeText, 'String' );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async () => {
		await SpecialListProperties.open();
		const numberOfPropertiesBefore = await SpecialListProperties.properties.length;

		await SpecialNewProperty.open( 'string' );
		await SpecialNewProperty.labelInput.setValue( 'Property type string' );
		await SpecialNewProperty.descriptionInput.setValue( 'A string property' );
		await SpecialNewProperty.submit();
		
		// wait for the cache to timeout, so the list of properties reflects the change
		await browser.pause( 1100 );

		await SpecialListProperties.open();
		const numberOfPropertiesAfter = await SpecialListProperties.properties.length;

		assert.strictEqual( numberOfPropertiesAfter, numberOfPropertiesBefore + 1 );
	} );

} );
