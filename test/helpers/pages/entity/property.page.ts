import { ChainablePromiseArray } from 'webdriverio';
import { Page } from '../page.js';

class PropertyPage extends Page {
	public get changeHistoryList(): ChainablePromiseElement {
		return $( 'ul.mw-contributions-list' );
	}
	public get changeHistoryItems(): ChainablePromiseArray<WebdriverIO.ElementArray> {
		return this.changeHistoryList.$$( 'li' );
	}
	public get mostRecentChange(): ChainablePromiseElement {
		return this.changeHistoryList.$( 'li.before' );
	}
	public get saveStatementLink(): ChainablePromiseElement {
		// Only return save button if enabled
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
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
