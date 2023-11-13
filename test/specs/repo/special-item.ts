import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';
import SpecialNewItem from '../../helpers/pages/special/new-item.page.js';

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {
		await SpecialNewItem.open();

		await SpecialNewItem.labelInput.setValue( 'Cool label' );
		await SpecialNewItem.descriptionInput.setValue( 'Cool description' );
		await SpecialNewItem.aliasesInput.setValue( 'Great job!|Bra Jobbat' );
		await SpecialNewItem.submit();

		await ItemPage.addStatementLink;
	} );
} );
