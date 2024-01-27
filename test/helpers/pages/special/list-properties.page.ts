import { Page } from '../page.js';
import { ChainablePromiseArray } from 'webdriverio';
import urlParameters from '../url-parameters.js';

class SpecialListPropertiesPage {
	private internalPage: Page = new Page();

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
	public async open( params: {
		dataType?: string;
		limit?: number;
		offset?: number;
	} ): Promise<void> {
		const paramString = urlParameters( {
			datatype: params.dataType ?? '',
			limit: params.limit ?? 50,
			offset: params.offset ?? 0
		} );

		await this.internalPage.open( `/wiki/Special:ListProperties${paramString}` );
		await this.content;
	}
}

export default new SpecialListPropertiesPage();
