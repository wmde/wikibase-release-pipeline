import assert from 'assert';

describe( 'ConfirmEdit', function () {
	it( 'Should allow to edit with captcha', async () => {
		const executionResult = await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert.strictEqual( executionResult, 'something great' );
	} );
} );
