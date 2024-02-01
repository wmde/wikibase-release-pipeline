import { Page } from '../page.js';
import urlParameters from '../url-parameters.js';

class ItemPage extends Page {
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
