'use strict';

const SpecialNewItem = require( '../../pages/special/new-item.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );

describe( 'Special:NewItem', function () {

	it( 'Should be able to create a new item', function () {

		SpecialNewItem.open();

		SpecialNewItem.labelInput.waitForDisplayed();

		SpecialNewItem.labelInput.setValue( 'Cool label' );
		SpecialNewItem.descriptionInput.setValue( 'Cool description' );
		SpecialNewItem.aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		SpecialNewItem.submit();

		ItemPage.addStatementLink.waitForDisplayed();

	} );
} );
