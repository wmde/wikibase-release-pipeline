import { Page } from '../page.js';

class PropertyPage extends Page {
	public get changeHistoryList(): ChainablePromiseElement {
		return $( 'ul.mw-contributions-list' );
	}
	public get mostRecentChange(): ChainablePromiseElement {
		return this.changeHistoryList.$( 'li.before' );
	}

	public async openHistoryTab(): Promise<void> {
		return $( '=View history' ).click();
	}

	/**
	 * `/wiki/Property:${propertyId}
	 *
	 * @param {string} propertyId
	 */
	public async open( propertyId: string ): Promise<void> {
		return super.open( `/wiki/Property:${propertyId}` );
	}
}

export default new PropertyPage();
