'use strict';

const SpecialNewItem = require( '../../helpers/pages/special/new-item.page' );
const ItemPage = require( 'wdio-wikibase/pageobjects/item.page' );

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {
		await SpecialNewItem.open();

		const labelInput = await SpecialNewItem.labelInput;
		await labelInput.waitForDisplayed();
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await SpecialNewItem.descriptionInput;
		await SpecialNewItem.descriptionInput.waitForDisplayed();
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await SpecialNewItem.aliasesInput;
		await aliasesInput.waitForDisplayed();
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewItem.submit();

		const addStatementLink = await ItemPage.addStatementLink;
		await addStatementLink.waitForDisplayed();
	} );
} );
