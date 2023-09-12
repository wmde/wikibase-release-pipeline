'use strict';

const assert = require( 'assert' );
const SpecialNewProperty = require( '../../helpers/pages/special/new-property.page' );

describe( 'Special:NewProperty', function () {
	it( 'Should be able to create a new property', async () => {
		await SpecialNewProperty.open( 'string' );

		const labelInput = await SpecialNewProperty.labelInput;
		await labelInput.waitForDisplayed();
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await SpecialNewProperty.descriptionInput;
		await descriptionInput.waitForDisplayed();
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await SpecialNewProperty.aliasesInput;
		await aliasesInput.waitForDisplayed();
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewProperty.submit();

		const propertyviewDatatypeValueEl = await $(
			'.wikibase-propertyview-datatype-value'
		);
		await propertyviewDatatypeValueEl.waitForDisplayed();
		const dataTypeText = await propertyviewDatatypeValueEl.getText();

		assert.strictEqual( dataTypeText, 'String' );
	} );
} );
