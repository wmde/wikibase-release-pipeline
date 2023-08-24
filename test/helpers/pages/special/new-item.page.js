'use strict';

const Page = require( '../page' );
class SpecialNewItem extends Page {

	get labelInput() { return $( 'input[name="label"]' ); }
	get descriptionInput() { return $( 'input[name="description"]' ); }
	get aliasesInput() { return $( 'input[name="aliases"]' ); }
	get submitBtn() { return $( 'button[type="submit"]' ); }

	open() {
		browser.url( process.env.MW_SERVER + '/wiki/Special:NewItem' );
	}

	submit() {
		this.submitBtn.click();
	}

}

module.exports = new SpecialNewItem();
