import SpecialEntityPage from 'wdio-wikibase/pageobjects/item.page.js';
import SpecialNewItemPage from '../../helpers/pages/special/new-item.page.js';

describe( 'Special:NewItem', function () {
	it( 'Should be able to create a new item', async () => {
		const label = 'Cool label';
		const description = 'Cool description';
		const firstAlias = 'Great job';
		const secondAlias = 'Bra Jobbat';

		await SpecialNewItemPage.open();

		await $( 'input[name="label"]' ).setValue( label );
		await $( 'input[name="description"]' ).setValue( description );
		await $( 'input[name="aliases"]' ).setValue( `${firstAlias}|${secondAlias}` );
		await SpecialNewItemPage.submit();

		await SpecialEntityPage.addStatementLink;

		await expect( $( '.wikibase-entitytermsforlanguageview-label' ) ).toHaveText(
			label
		);

		await expect(
			$( '.wikibase-entitytermsforlanguageview-description' )
		).toHaveText( description );

		await expect(
			$( '.wikibase-entitytermsforlanguageview-aliases li:nth-child(1)' )
		).toHaveText( firstAlias );

		await expect(
			$( '.wikibase-entitytermsforlanguageview-aliases li:nth-child(2)' )
		).toHaveText( secondAlias );
	} );
} );
