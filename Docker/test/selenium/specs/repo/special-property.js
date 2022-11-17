'use strict';

const assert = require( 'assert' );
const SpecialNewProperty = require( '../../pages/special/new-property.page' );

describe( 'Special:NewProperty', function () {

	it( 'Should be able to create a new property', function () {

		SpecialNewProperty.open( 'string' );

		SpecialNewProperty.labelInput.waitForDisplayed();

		SpecialNewProperty.labelInput.setValue( 'Cool label' );
		SpecialNewProperty.descriptionInput.setValue( 'Cool description' );
		SpecialNewProperty.aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		SpecialNewProperty.submit();

		$( '.wikibase-propertyview-datatype-value' ).waitForDisplayed();
		const dataTypeText = $( '.wikibase-propertyview-datatype-value' ).getText();

		assert.strictEqual( dataTypeText, 'String' );

	} );
} );
