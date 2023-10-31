import awaitDisplayed from '../../helpers/await-displayed.js';
import SpecialNewItem from '../../helpers/pages/special/new-item.page.js';
import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {
		await SpecialNewItem.open();

		const labelInput = await awaitDisplayed( SpecialNewItem.labelInput );
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await awaitDisplayed( SpecialNewItem.descriptionInput );
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await awaitDisplayed( SpecialNewItem.aliasesInput );
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewItem.submit();

		await awaitDisplayed( ItemPage.addStatementLink );
	} );
} );
