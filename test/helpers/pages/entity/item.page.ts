import { Page } from '../page.js';
import urlParameters from '../url-parameters.js';
import { ChainablePromiseArray } from 'webdriverio';

class ItemPage extends Page {
	public get image(): ChainablePromiseElement {
		return $( '.wikibase-snakview-value img' );
	}
	public get pageHistory(): ChainablePromiseElement {
		return $( '#pagehistory' );
	}
	public get pageHistoryItems(): ChainablePromiseArray<WebdriverIO.ElementArray> {
		return $$( '#pagehistory li' );
	}

	/**
	 * `/wiki/Item:${itemId}
	 *
	 * @param {string} itemId
	 * @param {string} action - Optional
	 */
	public async open( itemId: string, action: string = null ): Promise<void> {
		return super.open( `/wiki/Item:${itemId}${urlParameters( { action } )}` );
	}
}

export default new ItemPage();
