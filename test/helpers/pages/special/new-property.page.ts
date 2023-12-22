import SubmittablePage from '../submittable.page.js';

class SpecialNewProperty extends SubmittablePage {
	public get labelInput(): ChainablePromiseElement {
		return $( 'input[name="label"]' );
	}
	public get descriptionInput(): ChainablePromiseElement {
		return $( 'input[name="description"]' );
	}
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}
	public get datatypeInput(): ChainablePromiseElement {
		return $( '#wb-newproperty-datatype' );
	}
	public get submitBtn(): ChainablePromiseElement {
		return $( 'button[type="submit"]' );
	}

	public async open( dataType?: string ): Promise<void> {
		dataType = dataType ? '?datatype=' + dataType : '';
		await browser.url(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:NewProperty${dataType}`
		);
		await this.labelInput;
		await this.descriptionInput;
		await this.aliasesInput;
		await this.datatypeInput;
		await this.submitBtn;
	}
}

export default new SpecialNewProperty();
