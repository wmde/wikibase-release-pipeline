import assert from 'assert';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';

describe( 'Special:NewProperty', function () {
	it( 'Should be able to create a new property', async () => {
		await SpecialNewProperty.open( 'string' );

		const labelInput = await $( SpecialNewProperty.labelInput );
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await $( SpecialNewProperty.descriptionInput );
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await $( SpecialNewProperty.aliasesInput );
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewProperty.submit();

		const propertyviewDatatypeValueEl = await $(
			'.wikibase-propertyview-datatype-value'
		);
		const dataTypeText = await propertyviewDatatypeValueEl.getText();

		assert.strictEqual( dataTypeText, 'String' );
	} );
} );
