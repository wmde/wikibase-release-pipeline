import { Page } from './page.js';

export interface Submittable {
	submitBtn: ChainablePromiseElement;
	submit: () => Promise<void> ;
}

class SubmittablePage extends Page implements Submittable {
	public get submitBtn(): ChainablePromiseElement {
		return $( 'button[type="submit"]' );
	}

	public async submit(): Promise<void> {
		await this.submitBtn.click();
	}
}

export default SubmittablePage;
