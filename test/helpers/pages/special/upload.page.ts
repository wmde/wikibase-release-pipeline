import { Page } from '../page.js';
import { Submittable } from '../submittable.page.js';

class SpecialUploadPage implements Submittable {
	private internalPage: Page = new Page();

	public get firstHeading(): ChainablePromiseElement {
		return $( '#firstHeading' );
	}

	public get submitBtn(): ChainablePromiseElement {
		return $( 'input.mw-htmlform-submit' );
	}
	public submit: () => Promise<void> = () => this.submitBtn.click();

	public get uploadFileInput(): ChainablePromiseElement {
		return $( '#wpUploadFile' );
	}

	/**
	 * `/wiki/Special:Upload
	 */
	public async open(): Promise<void> {
		return this.internalPage.open( '/wiki/Special:Upload' );
	}
}

export default new SpecialUploadPage();
