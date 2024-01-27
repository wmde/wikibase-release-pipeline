import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

class SpecialNewPropertyPage extends SubmittablePage {
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}
	public get datatypeInput(): ChainablePromiseElement {
		return $( '#wb-newproperty-datatype' );
	}
	public datatypeOptionLabel( dataType: string ): ChainablePromiseElement {
		return $( `.oo-ui-labelElement-label=${dataType}` );
	}
	public get datatypeSelectDropdown(): ChainablePromiseElement {
		return $( 'oo-ui-menuSelectWidget' );
	}
	public get datatypeValue(): ChainablePromiseElement {
		return $( '.wikibase-propertyview-datatype-value' );
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
