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

		const propertyviewDatatypeValueEl = await $(
			'.wikibase-propertyview-datatype-value'
		);
		const dataTypeText = await propertyviewDatatypeValueEl.getText();
		assert.strictEqual( dataTypeText, 'String' );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async () => {
		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesBefore = await SpecialListProperties.properties.length;

		await SpecialNewProperty.open( 'string' );
		await SpecialNewProperty.labelInput.setValue( 'Property type string' );
		await SpecialNewProperty.descriptionInput.setValue( 'A string property' );
		await SpecialNewProperty.submit();

		// wait for the $wgWBRepoSettings['sharedCacheDuration'] cache to
		// timeout, so the list of properties reflects the change
		await browser.pause( 1100 );

		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesAfter = await SpecialListProperties.properties.length;

		assert.strictEqual( numberOfPropertiesAfter, numberOfPropertiesBefore + 1 );
	} );
} );
