import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

class SpecialNewPropertyPage extends SubmittablePage {
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

	/**
	 * `/wiki/Special:NewProperty`
	 *
	 * @param {string} dataType - Optional
	 */
	public async open( dataType?: string ): Promise<void> {
		await super.open( `/wiki/Special:NewProperty${urlParameters( { datatype: dataType } )}` );
		await this.labelInput;
		await this.descriptionInput;
		await this.aliasesInput;
		await this.datatypeInput;
		await this.submitBtn;
	}
}

export default new SpecialNewPropertyPage();
