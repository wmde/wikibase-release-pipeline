import Page from './page.js';

class SubmittablePage extends Page {
	public get submitBtn(): ChainablePromiseElement {
		return $( 'button[type="submit"]' );
	}

	public async submit(): Promise<void> {
		await this.submitBtn.click();
	}
}

export default SubmittablePage;
