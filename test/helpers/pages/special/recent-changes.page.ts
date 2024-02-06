import SubmittablePage from '../submittable.page.js';
import urlParameters from '../url-parameters.js';

type SpecialRecentChangesPageParams = {
	limit: 50 | 100 | 250 | 500;
	days?: 1 | 3 | 7 | 14 | 30;
	hours?: 1 | 2 | 6 | 12;
	urlversion: number;
	enhanced: number;
};

class SpecialRecentChangesPage extends SubmittablePage {
	public get changeLimit(): ChainablePromiseElement {
		return $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' );
	}
	public get changeLimitText(): Promise<string> {
		return this.changeLimit.getText();
	}

	/**
	 * `/wiki/Special:RecentChanges`
	 *
	 * @param {Object} params
	 * @param {number} params.limit
	 * @param {number} params.days
	 * @param {number} params.hours
	 * @param {number} params.urlversion
	 * @param {number} params.enhanced
	 */
	public async open(
		params: SpecialRecentChangesPageParams | string = {
			limit: 50,
			days: 7,
			urlversion: 2,
			enhanced: 0
		}
	): Promise<void> {
		if ( typeof params === 'string' ) {
			throw new Error( 'Invalid parameter' );
		}

		return super.open( `/wiki/Special:RecentChanges${urlParameters( params )}` );
	}
}

export default new SpecialRecentChangesPage();
