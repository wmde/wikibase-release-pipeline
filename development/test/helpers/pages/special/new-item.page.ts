import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

type SpecialNewItemPageParams = {
	uselang?: string;
};

class SpecialNewItemPage extends SubmittablePage {
	public get firstHeading(): ChainablePromiseElement {
		return $( 'h1#firstHeading' );
	}

	/**
	 * `/wiki/Special:NewItem`
	 *
	 * @param {Object} params
	 * @param {string} params.uselang - Optional
	 * @return {void}
	 */
	public async open(
		params: SpecialNewItemPageParams | string = {}
	): Promise<void> {
		if ( typeof params === 'string' ) {
			throw new Error( 'Invalid parameter' );
		}

		return super.open( `/wiki/Special:NewItem${ urlParameters( params ) }` );
	}
}

export default new SpecialNewItemPage();
