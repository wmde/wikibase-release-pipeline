import Page from '../page.js';
import awaitDisplayed from '../../await-displayed.js';

class SpecialListProperties extends Page {
	public get content(): ChainablePromiseElement {
		return $( '.mw-spcontent' );
	}
	public get properties(): ChainablePromiseArray {
		return $$( '.mw-spcontent ol li' );
	}

	public async open(): Promise<void> {
		await browser.url(
			`${process.env.MW_SERVER}/wiki/Special:ListProperties`
		);

		await awaitDisplayed( this.content );
	}
}

export default new SpecialListProperties();
