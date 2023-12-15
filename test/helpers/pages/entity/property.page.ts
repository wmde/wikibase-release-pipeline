import Page from '../page.js';

class Property extends Page {
	public get save(): ChainablePromiseElement {
		// Only return the enabled save button
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
	}
	public get addStatement(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get addReference(): ChainablePromiseElement {
		return $( '=add reference' );
	}

	public async open( id: string ): Promise<void> {
		await browser.url( `${testEnv.vars.WIKIBASE_URL}/wiki/Property:${id}` );
	}
}

export default new Property();
