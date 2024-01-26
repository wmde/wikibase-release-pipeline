import { Page } from '../page.js';
import urlParameters from '../url-parameters.js';

class ItemPage extends Page {
	/**
	 * `/wiki/Item:${itemId}
	 *
	 * @param {string} itemId
	 * @param {string} action - Optional
	 */
	public async open( itemId: string, action: string = null ): Promise<void> {
		await super.open( `/wiki/Item:${itemId}${urlParameters( { action } )}` );
	}
}

export default new ItemPage();
