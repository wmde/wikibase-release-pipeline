import envVars from '../../../setup/envVars.js';
import Page from '../page.js';

class Property extends Page {
	public get save(): ChainablePromiseElement {
		return $( '=save' );
	}
	public get addStatement(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get addReference(): ChainablePromiseElement {
		return $( '=add reference' );
	}

	public async open( id: string ): Promise<void> {
		await browser.url( `${envVars.WIKIBASE_URL}/wiki/Property:${id}` );
	}
}

export default new Property();
