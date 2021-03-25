'use strict';

const Page = require( '../page' );

class QueryServiceUI extends Page {

	get queryEditor() { return $( '.queryEditor' ); }
	get submitBtn() { return $( '#execute-button' ); }
	get resultTable() { return $( '#query-result table.table.table-hover' ); }
	get resultTableRows() { return $( '#query-result table.table.table-hover tr' ); }

	open( query, prefixes ) {
		if ( prefixes ) {
			query = prefixes.join( '\n' ) + '\n' + query;
		}
		super.open( '/#' + encodeURI( query ) );
	}

	submit() {
		this.submitBtn.click();
	}

	resultIncludes( prop, value ) {
		const text = this.resultTable.getText();
		if ( !value ) {
			return text.includes( prop );
		}

		const regexp = new RegExp( '(' + prop + ')(\\s+)(' + value + ')' );
		const matches = text.match( regexp );
		return matches !== null;
	}

}

module.exports = new QueryServiceUI();
