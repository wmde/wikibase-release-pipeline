import { Page } from '../page.js';

class PropertyPage extends Page {
	public get saveStatementLink(): ChainablePromiseElement {
		// Only return save button if enabled
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
	}

	/**
	 * `/wiki/Property:${propertyId}
	 *
	 * @param {string} propertyId
	 * @return {void}
	 */
	public async open( propertyId: string ): Promise<void> {
		return super.open( `/wiki/Property:${ propertyId }` );
	}
}

export default new PropertyPage();
