import { Page } from '../page.js';
import { ChainablePromiseArray } from 'webdriverio';

class SpecialListPropertiesPage extends Page {
	public get content(): ChainablePromiseElement {
		return $( '.mw-spcontent' );
	}
	public get properties(): ChainablePromiseArray<WebdriverIO.ElementArray> {
		return $$( '.mw-spcontent ol li' );
	}

	/**
	 * `/wiki/Special:ListProperties`
	 *
	 * @param {Object} params
	 * @param {string} params.dataType - Optional, default empty string
	 * @param {number} params.limit - Optional, default `50`
	 * @param {number} params.offset - Optional, default `0`
	 */
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
