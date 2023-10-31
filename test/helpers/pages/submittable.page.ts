import awaitDisplayed from '../await-displayed.js';
import Page from './page.js';

class SubmittablePage extends Page {
	public get submitBtn(): ChainablePromiseElement {
		return $( 'button[type="submit"]' );
	}

	public async submit(): Promise<void> {
		const button = await awaitDisplayed( this.submitBtn );
		await button.click();
	}
}

export default SubmittablePage;
