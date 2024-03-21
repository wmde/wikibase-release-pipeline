import SubmittablePage from '../submittable.page.js';

class QueryServiceUIPage extends SubmittablePage {
	public get submitBtn(): ChainablePromiseElement {
		return $( '#execute-button' );
	}

	public get resultTable(): ChainablePromiseElement {
		return $( '#query-result table.table.table-hover' );
	}

	/**
	 * `${testEnv.vars.WDQS_FRONTEND_URL}/#${prefixes, query}`
	 *
	 * @param {string} query
	 * @param {string[]} prefixes - Optional
	 */
	public async open( query: string, prefixes: string[] = [] ): Promise<void> {
		await browser.url( testEnv.vars.WDQS_FRONTEND_URL );
		if ( prefixes ) {
			query = [ ...prefixes, query ].join( '\n' );
		}
		return browser.url(
			`${ testEnv.vars.WDQS_FRONTEND_URL }/#${ encodeURI( query ) }`
		);
	}

	public async resultIncludes( prop: string, value?: string ): Promise<boolean> {
		const text = await this.resultTable.getText();
		if ( !value ) {
			return text.includes( prop );
		}

		// eslint-disable-next-line security/detect-non-literal-regexp
		const regexp = new RegExp( `(${ prop })(\\s+)(${ value })` );
		const matches = text.match( regexp );
		return matches !== null;
	}
}

export default new QueryServiceUIPage();
