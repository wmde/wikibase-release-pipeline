import { Page } from '../page.js';

class ItemPage extends Page {

	public async open( itemId: string ): Promise<void> {
		await super.open( `/wiki/Item:${itemId}` );
	}
}

export default new ItemPage();
