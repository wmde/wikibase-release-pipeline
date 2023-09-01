'use strict';

const Page = require( '../page' );

class SpecialNewProperty extends Page {

	get labelInput() { return $( 'input[name="label"]' ); }
	get descriptionInput() { return $( 'input[name="description"]' ); }
	get aliasesInput() { return $( 'input[name="aliases"]' ); }
	get datatypeInput() { return $( '#wb-newproperty-datatype' ); }

	get submitBtn() { return $( 'button[type="submit"]' ); }

	async open( dataType ) {

		dataType = dataType ? '?datatype=' + dataType : '';
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewProperty' + dataType );
	}

	async submit() {
		const submitBtn = await this.submitBtn;
		await submitBtn.click();
	}

}

module.exports = new SpecialNewProperty();
