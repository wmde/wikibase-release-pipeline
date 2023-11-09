import Page from '../page.js';
import { ChainablePromiseArray } from 'webdriverio';

class SpecialListProperties extends Page {
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

		await browser.url(
			`${process.env.MW_SERVER}/wiki/Special:ListProperties?${dataType}&${limit}&${offset}`
		);

		await this.content;
	}
}

export default new SpecialListProperties();
