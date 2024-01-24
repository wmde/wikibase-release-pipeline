import SubmittablePage from '../submittable.page.js';

class SpecialNewItemPage extends SubmittablePage {
	public get labelInput(): ChainablePromiseElement {
		return $( 'input[name="label"]' );
	}
	public get descriptionInput(): ChainablePromiseElement {
		return $( 'input[name="description"]' );
	}
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}

	public async open(): Promise<void> {
		return super.open( '/wiki/Special:NewItem' );
	}
}

export default new SpecialNewItemPage();
