import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

class SpecialNewItemPage extends SubmittablePage {
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}
	public get descriptionInput(): ChainablePromiseElement {
		return $( 'input[name="description"]' );
	}
	public get firstHeading(): ChainablePromiseElement {
		return $( 'h1#firstHeading' );
	}
	public get labelInput(): ChainablePromiseElement {
		return $( 'input[name="label"]' );
	}

	/**
	 * `/wiki/Special:NewItem`
	 *
	 * @param {string} uselang - Optional
	 */
	public async open( uselang: string = null ): Promise<void> {
		return super.open( `/wiki/Special:NewItem${urlParameters( { uselang } )}` );
	}
}

export default new SpecialNewItemPage();
