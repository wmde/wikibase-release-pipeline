import assert from 'assert';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';
import awaitDisplayed from '../../helpers/await-displayed.js';

describe( 'Special:NewProperty', function () {
	it( 'Should be able to create a new property', async () => {
		await SpecialNewProperty.open( 'string' );

		const labelInput = await awaitDisplayed( SpecialNewProperty.labelInput );
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await awaitDisplayed( SpecialNewProperty.descriptionInput );
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await awaitDisplayed( SpecialNewProperty.aliasesInput );
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewProperty.submit();

		const propertyviewDatatypeValueEl = await awaitDisplayed(
			'.wikibase-propertyview-datatype-value'
		);
		const dataTypeText = await propertyviewDatatypeValueEl.getText();

		assert.strictEqual( dataTypeText, 'String' );
	} );
} );
