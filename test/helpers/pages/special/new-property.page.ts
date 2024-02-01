import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

type SpecialNewPropertyPageParams = {
	datatype?: string;
};

class SpecialNewPropertyPage extends SubmittablePage {
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}
	public get datatypeInput(): ChainablePromiseElement {
		return $( '#wb-newproperty-datatype' );
	}
	public get descriptionInput(): ChainablePromiseElement {
		return $( 'input[name="description"]' );
	}
	public get labelInput(): ChainablePromiseElement {
		return $( 'input[name="label"]' );
	}

	/**
	 * `/wiki/Special:NewProperty`
	 *
	 * @param {Object} params
	 * @param {string} params.datatype - Optional
	 */
	public async open(
		params: SpecialNewPropertyPageParams | string = {}
	): Promise<void> {
		if ( typeof params === 'string' ) {
			throw new Error( 'Invalid parameter' );
		}

		await super.open( `/wiki/Special:NewProperty${urlParameters( params )}` );
		await this.labelInput;
		await this.descriptionInput;
		await this.aliasesInput;
		await this.datatypeInput;
		await this.submitBtn;
	}
}

export default new SpecialNewPropertyPage();
