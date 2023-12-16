import Page from '../page.js';

class Property extends Page {
	public get save(): ChainablePromiseElement {
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
	}
	public get addStatement(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get addReference(): ChainablePromiseElement {
		return $( '=add reference' );
	}

	public async open( id: string ): Promise<void> {
		await browser.url( `${process.env.MW_SERVER}/wiki/Property:${id}` );
	}
}

export default new Property();
