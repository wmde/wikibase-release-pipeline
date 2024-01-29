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
	 * @param {Object} params - Optional
	 * @param {string} params.action - Optional
	 */
	public async open( itemId: string, params: {action?: string} = {} ): Promise<void> {
		return super.open( `/wiki/Item:${itemId}${urlParameters( params )}` );
	}
}

export default new ItemPage();
