import { Page } from '../page.js';

class PropertyPage extends Page {
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
