import { Page } from '../page.js';

class Property extends Page {
	public get saveStatement(): ChainablePromiseElement {
		// Only return save button if enabled
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
