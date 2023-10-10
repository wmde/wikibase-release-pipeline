import Page from '../page.js';

class SpecialNewProperty extends Page {
	get labelInput() { return $( 'input[name="label"]' ); }
	get descriptionInput() { return $( 'input[name="description"]' ); }
	get aliasesInput() { return $( 'input[name="aliases"]' ); }
	get datatypeInput() { return $( '#wb-newproperty-datatype' ); }
	get submitBtn() { return $( 'button[type="submit"]' ); }

	async open( dataType?: string ): Promise<void> {
		dataType = dataType ? '?datatype=' + dataType : '';
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewProperty' + dataType );
	}

	async submit() : Promise<void> {
		const submitBtn = await this.submitBtn;
		await submitBtn.waitForDisplayed();
		await submitBtn.click();
	}
}

export default new SpecialNewProperty();
