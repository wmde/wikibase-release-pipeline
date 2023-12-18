import SubmittablePage from '../submittable.page.js';

class QueryServiceUI extends SubmittablePage {
	public get queryEditor(): ChainablePromiseElement {
		return $( '.queryEditor' );
	}
	public get submitBtn(): ChainablePromiseElement {
		return $( '#execute-button' );
	}
	public get resultTable(): ChainablePromiseElement {
		return $( '#query-result table.table.table-hover' );
	}
	public get resultTableRows(): ChainablePromiseElement {
		return $( '#query-result table.table.table-hover tr' );
	}

	public open( query: string, prefixes?: string[] ): Promise<void> {
		if ( prefixes ) {
			query = prefixes.join( '\n' ) + '\n' + query;
		}
		return browser.url( `${process.env.WDQS_FRONTEND_SERVER}${'/#' + encodeURI( query )}` );
	}

	public async resultIncludes( prop: string, value?: string ): Promise<boolean> {
		const text = await this.resultTable.getText();
		if ( !value ) {
			return text.includes( prop );
		}

		// eslint-disable-next-line security/detect-non-literal-regexp
		const regexp = new RegExp( `(${prop})(\\s+)(${value})` );
		const matches = text.match( regexp );
		return matches !== null;
	}
}

export default new QueryServiceUI();
