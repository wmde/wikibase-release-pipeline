'use strict';

const Page = require( '../page' );
class SpecialNewItem extends Page {

	get labelInput() { return $( 'input[name="label"]' ); }
	get descriptionInput() { return $( 'input[name="description"]' ); }
	get aliasesInput() { return $( 'input[name="aliases"]' ); }
	get submitBtn() { return $( 'button[type="submit"]' ); }

	async open() {
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem' );
	}

	async submit() {
		const button = await this.submitBtn;
		await this.submitBtn.waitForDisplayed();
		await button.click();
	}

}

module.exports = new SpecialNewItem();
