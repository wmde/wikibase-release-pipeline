import Page from '../page.js';

class Property extends Page {
	public get save(): ChainablePromiseElement {
		return $( '=save' );
	}
	public get addStatement(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get addReference(): ChainablePromiseElement {
		return $( '=add reference' );
	}

	public async open( id: string ): Promise<void> {
		await browser.url( `${globalThis.env.MW_SERVER}/wiki/Property:${id}` );
	}
}

export default new Property();
