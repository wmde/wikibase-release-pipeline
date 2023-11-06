import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';
import SpecialNewItem from '../../helpers/pages/special/new-item.page.js';

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {
		await SpecialNewItem.open();

		const labelInput = await SpecialNewItem.labelInput;
		await labelInput.setValue( 'Cool label' );

		const descriptionInput = await SpecialNewItem.descriptionInput;
		await descriptionInput.setValue( 'Cool description' );

		const aliasesInput = await SpecialNewItem.aliasesInput;
		await aliasesInput.setValue( 'Great job!|Bra Jobbat' );

		await SpecialNewItem.submit();

		await $( ItemPage.addStatementLink );
	} );
} );
