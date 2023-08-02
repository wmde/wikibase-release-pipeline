'use strict';

const assert = require( 'assert' );

describe( 'ConfirmEdit', function () {

	it( 'Should allow to edit with captcha', function () {

		const executionResult = browser.editPage(
			process.env.WIKIBASE_PUBLIC_URL,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert.strictEqual( executionResult, 'something great' );

	} );

} );
