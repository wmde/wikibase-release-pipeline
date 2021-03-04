'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../helpers/default-functions' );

describe( 'Pingback', function () {

	before( function () {
		defaultFunctions();
	} );

	it( 'Should ping on first page request', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Main_Page' );

		browser.pause( 5 * 1000 );

		const sqlResult = browser.dbQuery( 'SELECT * from updatelog where ul_key LIKE "WikibasePingback%"' );

		assert( sqlResult.includes( 'WikibasePingback' ) === true );
		assert( sqlResult.includes( 'WikibasePingback-1.' ) === true );

		const result = browser.makeRequest( process.env.PINGBACK_BEACON_SERVER );
		assert( result.data.length === 2 );

		const requestData = JSON.parse(
			Object.keys( result.data[ 0 ] )[ 0 ].replace( ';', '' )
		);

		assert( requestData.schema === 'WikibasePingback' );
	} );

} );
