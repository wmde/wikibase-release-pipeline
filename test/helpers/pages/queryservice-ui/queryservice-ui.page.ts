import Page from '../page.js';

class QueryServiceUI extends Page {
	get queryEditor() { return $( '.queryEditor' ); }
	get submitBtn() { return $( '#execute-button' ); }
	get resultTable() { return $( '#query-result table.table.table-hover' ); }
	get resultTableRows() { return $( '#query-result table.table.table-hover tr' ); }

	open( query: string, prefixes?: string[] ): Promise<void> {
		if ( prefixes ) {
			query = prefixes.join( '\n' ) + '\n' + query;
		}
		return super.open( '/#' + encodeURI( query ) );
	}

	async submit(): Promise<void> {
		const button = await this.submitBtn;
		await button.waitForDisplayed();
		await button.click();
	}

	async resultIncludes( prop: string, value?: string ): Promise<boolean> {
		const resultTable = await this.resultTable;
		const text = await resultTable.getText();
		if ( !value ) {
			return text.includes( prop );
		}

		const regexp = new RegExp( '(' + prop + ')(\\s+)(' + value + ')' );
		const matches = text.match( regexp );
		return matches !== null;
	}
}

export default new QueryServiceUI();
