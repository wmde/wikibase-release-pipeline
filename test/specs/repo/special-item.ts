import ItemPage from 'wdio-wikibase/pageobjects/item.page.js';
import SpecialNewItemPage from '../../helpers/pages/special/new-item.page.js';
import assert from 'assert';

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {

		const label = 'Cool label';
		const description = 'Cool description';
		const firstAlias = 'Great job';
		const secondAlias = 'Bra Jobbat';

		await SpecialNewItemPage.open();

		await SpecialNewItemPage.labelInput.setValue( label );
		await SpecialNewItemPage.descriptionInput.setValue( description );
		await SpecialNewItemPage.aliasesInput.setValue( firstAlias + '|' + secondAlias );
		await SpecialNewItemPage.submit();

		await ItemPage.addStatementLink;

		const labelText = await $(
			'.wikibase-entitytermsforlanguageview-label'
		).getText();
		assert.strictEqual( labelText, label );

		const descriptionText = await $(
			'.wikibase-entitytermsforlanguageview-description'
		).getText();
		assert.strictEqual( descriptionText, description );

		const firstAliasText = await $(
			'.wikibase-entitytermsforlanguageview-aliases li:nth-child(1)'
		).getText();
		assert.strictEqual( firstAliasText, firstAlias );

		const secondAliasText = await $(
			'.wikibase-entitytermsforlanguageview-aliases li:nth-child(2)'
		).getText();
		assert.strictEqual( secondAliasText, secondAlias );
	} );
} );
