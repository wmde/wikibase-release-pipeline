import { Page } from '../page.js';

class Property extends Page {
	public get saveStatementLink(): ChainablePromiseElement {
		// Only return save button if enabled
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
	}
	public get addStatementLink(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get addReferenceLink(): ChainablePromiseElement {
		return $( '=add reference' );
	}

	public async open( id: string ): Promise<void> {
		await browser.url( `${testEnv.vars.WIKIBASE_URL}/wiki/Property:${id}` );
	}
}

export default new Property();
