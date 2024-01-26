import { Page } from '../page.js';

class PropertyPage extends Page {
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

	/**
	 * `/wiki/Property:${propertyId}
	 *
	 * @param {string} propertyId
	 */
	public async open( propertyId: string ): Promise<void> {
		await super.open( `/wiki/Property:${propertyId}` );
	}
}

export default new PropertyPage();
