import Page from '../page.js';

class QueryServiceUI extends Page {
	public get queryEditor(): ChainablePromiseElement { return $( '.queryEditor' ); }
	public get submitBtn(): ChainablePromiseElement { return $( '#execute-button' ); }
	public get resultTable(): ChainablePromiseElement { return $( '#query-result table.table.table-hover' ); }
	public get resultTableRows(): ChainablePromiseElement { return $( '#query-result table.table.table-hover tr' ); }

	public open( query: string, prefixes?: string[] ): Promise<void> {
		if ( prefixes ) {
			query = prefixes.join( '\n' ) + '\n' + query;
		}
		return super.open( '/#' + encodeURI( query ) );
	}

	public async submit(): Promise<void> {
		const button = await this.submitBtn;
		await button.waitForDisplayed();
		await button.click();
	}

	public async resultIncludes( prop: string, value?: string ): Promise<boolean> {
		const resultTable = await this.resultTable;
		const text = await resultTable.getText();
		if ( !value ) {
			return text.includes( prop );
		}

		const regexp = new RegExp( `(${prop})(\\s+)(${value})` );
		const matches = text.match( regexp );
		return matches !== null;
	}
}

export default new QueryServiceUI();
