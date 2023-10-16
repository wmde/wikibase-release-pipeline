import SubmittablePage from '../submittable.page.js';

class SpecialNewItem extends SubmittablePage {
	public get labelInput(): ChainablePromiseElement {
		return $( 'input[name="label"]' );
	}
	public get descriptionInput(): ChainablePromiseElement {
		return $( 'input[name="description"]' );
	}
	public get aliasesInput(): ChainablePromiseElement {
		return $( 'input[name="aliases"]' );
	}
	public get submitBtn(): ChainablePromiseElement {
		return $( 'button[type="submit"]' );
	}

	public async open(): Promise<void> {
		await browser.url( `${process.env.MW_SERVER}/wiki/Special:NewItem` );
	}
}

export default new SpecialNewItem();
