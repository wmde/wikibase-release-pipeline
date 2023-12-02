import assert from 'assert';

describe( 'ConfirmEdit', function () {
	it( 'Should allow to edit with captcha', async () => {
		const executionResult = await browser.editPage(
			globalThis.env.MW_SERVER,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert.strictEqual( executionResult, 'something great' );
	} );
} );
