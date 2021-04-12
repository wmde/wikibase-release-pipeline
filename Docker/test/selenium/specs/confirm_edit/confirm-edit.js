'use strict';

const { assert } = require( 'console' );
const defaultFunctions = require( '../../helpers/default-functions' );

describe( 'ConfirmEdit', function () {

	before( function () {
		defaultFunctions();
	} );

	it( 'Should allow to edit with captcha', function () {

		const executionResult = browser.editPage(
			process.env.MW_SERVER,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert( executionResult === 'something great' );

	} );

} );
