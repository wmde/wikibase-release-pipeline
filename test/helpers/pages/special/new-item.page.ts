import Page from '../page.js';

class SpecialNewItem extends Page {
	get labelInput() { return $( 'input[name="label"]' ); }
	get descriptionInput() { return $( 'input[name="description"]' ); }
	get aliasesInput() { return $( 'input[name="aliases"]' ); }
	get submitBtn() { return $( 'button[type="submit"]' ); }

	async open() : Promise<void> {
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem' );
	}

	async submit() : Promise<void> {
		const button = await this.submitBtn;
		await this.submitBtn.waitForDisplayed();
		await button.click();
	}
}

export default new SpecialNewItem();
