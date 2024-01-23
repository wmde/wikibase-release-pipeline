import { Page } from '../page.js';

class ItemPage extends Page {
	public async open( itemId: string, action: string = null ): Promise<void> {
		const actionURI = action ? `?action=${action}` : '';
		await super.open( `/wiki/Item:${itemId}${actionURI}` );
	}
}

export default new ItemPage();
