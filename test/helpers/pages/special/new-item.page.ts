import awaitDisplayed from '../../await-displayed.js';
import Page from '../page.js';

class SpecialNewItem extends Page {
	public get labelInput(): ChainablePromiseElement { return $( 'input[name="label"]' ); }
	public get descriptionInput(): ChainablePromiseElement { return $( 'input[name="description"]' ); }
	public get aliasesInput(): ChainablePromiseElement { return $( 'input[name="aliases"]' ); }
	public get submitBtn(): ChainablePromiseElement { return $( 'button[type="submit"]' ); }

	public async open(): Promise<void> {
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem' );
	}

	public async submit(): Promise<void> {
		const button = await awaitDisplayed( this.submitBtn );
		await button.click();
	}
}

export default new SpecialNewItem();
