import { EntityData } from '../../../types/entity-data.js';

/* eslint-disable jsdoc/require-returns-type */
class SpecialEntityDataPage {
	/**
	 * `/wiki/Special:EntityData/${entityId}.${extension}`;
	 *
	 * @param {string} entityId
	 * @param {string} extension - Defaults to `json`
	 * @return Fetched data
	 */
	public async getData(
		entityId: string,
		extension: string = 'json'
	): Promise<EntityData> {
		const response = await browser.makeRequest(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:EntityData/${entityId}.${extension}`
		);
		return response.data;
	}
}

export default new SpecialEntityDataPage();
