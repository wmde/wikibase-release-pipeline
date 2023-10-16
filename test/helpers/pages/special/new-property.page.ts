import awaitDisplayed from '../../await-displayed.js';
import Page from '../page.js';

class SpecialNewProperty extends Page {
	public get labelInput(): ChainablePromiseElement { return $( 'input[name="label"]' ); }
	public get descriptionInput(): ChainablePromiseElement { return $( 'input[name="description"]' ); }
	public get aliasesInput(): ChainablePromiseElement { return $( 'input[name="aliases"]' ); }
	public get datatypeInput(): ChainablePromiseElement { return $( '#wb-newproperty-datatype' ); }
	public get submitBtn(): ChainablePromiseElement { return $( 'button[type="submit"]' ); }

	public async open( dataType?: string ): Promise<void> {
		dataType = dataType ? '?datatype=' + dataType : '';
		await browser.url( process.env.MW_SERVER + '/wiki/Special:NewProperty' + dataType );
	}

	public async submit(): Promise<void> {
		const submitBtn = await awaitDisplayed( this.submitBtn );
		await submitBtn.click();
	}
}

export default new SpecialNewProperty();
