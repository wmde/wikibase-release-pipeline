import { Page } from '../page.js';
import { ChainablePromiseArray } from 'webdriverio';

class SpecialListPropertiesPage extends Page {
	public get content(): ChainablePromiseElement {
		return $( '.mw-spcontent' );
	}
	public get properties(): ChainablePromiseArray<WebdriverIO.ElementArray> {
		return $$( '.mw-spcontent ol li' );
	}

	public async openParams( params: {
		dataType?: string;
		limit?: number;
		offset?: number;
	} ): Promise<void> {
		const dataType = 'datatype=' + ( params.dataType ?? '' );
		const limit = 'limit=' + ( params.limit ?? 50 );
		const offset = 'offset=' + ( params.offset ?? 0 );

		await super.open(
			`/wiki/Special:ListProperties?${dataType}&${limit}&${offset}`
		);

		await this.content;
	}
}

export default new SpecialListPropertiesPage();
